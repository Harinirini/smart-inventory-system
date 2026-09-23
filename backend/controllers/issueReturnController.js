const IssueReturn = require('../models/IssueReturn');
const Asset = require('../models/Asset');
const Notification = require('../models/Notification');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Issue an asset to student or staff
// @route   POST /api/assets/:id/issue
// @access  Private (Admin, Lab Staff)
exports.issueAsset = async (req, res) => {
  try {
    const { issuedTo, expectedReturnDate, remarks } = req.body;
    const { id } = req.params;

    if (!issuedTo || !issuedTo.name || !issuedTo.identifier) {
      return res.status(400).json({
        success: false,
        message: 'Recipient name and ID / Roll number are required.',
      });
    }

    if (!expectedReturnDate) {
      return res.status(400).json({
        success: false,
        message: 'Expected return date is required.',
      });
    }

    let asset;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      asset = await Asset.findById(id);
    } else {
      asset = await Asset.findOne({ assetId: id.toUpperCase() });
    }

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    if (asset.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Asset cannot be issued because its current status is '${asset.status}'. Only 'Available' assets can be issued.`,
      });
    }

    // Create Issue record
    const issueRecord = await IssueReturn.create({
      asset: asset._id,
      assetId: asset.assetId,
      assetName: asset.name,
      issuedTo: {
        name: issuedTo.name,
        identifier: issuedTo.identifier,
        department: issuedTo.department || asset.department,
        email: issuedTo.email,
        phone: issuedTo.phone,
      },
      issueDate: new Date(),
      expectedReturnDate: new Date(expectedReturnDate),
      issuedBy: req.user._id,
      issuedByName: req.user.name,
      status: 'Issued',
      remarks,
    });

    // Update Asset status
    asset.status = 'Issued';
    asset.assignedTo = `${issuedTo.name} (${issuedTo.identifier})`;
    await asset.save();

    await logAudit({
      user: req.user,
      req,
      action: 'ISSUE_ASSET',
      module: 'IssueReturn',
      recordId: asset.assetId,
      description: `Issued asset ${asset.name} (${asset.assetId}) to ${issuedTo.name} (${issuedTo.identifier}). Expected return: ${new Date(expectedReturnDate).toLocaleDateString()}.`,
    });

    res.status(201).json({
      success: true,
      message: 'Asset issued successfully.',
      data: {
        asset,
        issueRecord,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error issuing asset',
      error: error.message,
    });
  }
};

// @desc    Return an issued asset
// @route   POST /api/assets/:id/return
// @access  Private (Admin, Lab Staff)
exports.returnAsset = async (req, res) => {
  try {
    const { conditionAfterReturn, remarks, recordId } = req.body;
    const { id } = req.params;

    let asset;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      asset = await Asset.findById(id);
    } else {
      asset = await Asset.findOne({ assetId: id.toUpperCase() });
    }

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    // Find active issue record
    let issueRecord;
    if (recordId) {
      issueRecord = await IssueReturn.findById(recordId);
    } else {
      issueRecord = await IssueReturn.findOne({
        asset: asset._id,
        status: { $in: ['Issued', 'Overdue'] },
      }).sort({ createdAt: -1 });
    }

    if (!issueRecord) {
      return res.status(400).json({
        success: false,
        message: 'No active issue record found for this asset.',
      });
    }

    // Update issue record
    issueRecord.returnDate = new Date();
    issueRecord.returnedBy = req.user._id;
    issueRecord.returnedByName = req.user.name;
    issueRecord.conditionAfterReturn = conditionAfterReturn || asset.condition;
    issueRecord.status = 'Returned';
    if (remarks) {
      issueRecord.remarks = issueRecord.remarks
        ? `${issueRecord.remarks} | Return Note: ${remarks}`
        : `Return Note: ${remarks}`;
    }
    await issueRecord.save();

    // Update asset
    const prevHolder = asset.assignedTo;
    asset.assignedTo = '';

    if (conditionAfterReturn) {
      asset.condition = conditionAfterReturn;
    }

    if (conditionAfterReturn === 'Damaged') {
      asset.status = 'Damaged';
    } else {
      asset.status = 'Available';
    }
    await asset.save();

    await logAudit({
      user: req.user,
      req,
      action: 'RETURN_ASSET',
      module: 'IssueReturn',
      recordId: asset.assetId,
      description: `Returned asset ${asset.name} (${asset.assetId}) previously held by ${prevHolder}. Condition: ${asset.condition}. Status: ${asset.status}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Asset returned successfully.',
      data: {
        asset,
        issueRecord,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error returning asset',
      error: error.message,
    });
  }
};

// @desc    Get all issue/return checkout records with dynamic overdue recalculation
// @route   GET /api/issue-records
// @access  Private
exports.getIssueRecords = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { assetName: { $regex: search, $options: 'i' } },
        { assetId: { $regex: search, $options: 'i' } },
        { 'issuedTo.name': { $regex: search, $options: 'i' } },
        { 'issuedTo.identifier': { $regex: search, $options: 'i' } },
      ];
    }

    let records = await IssueReturn.find(query).sort({ createdAt: -1 });

    const now = new Date();
    // Dynamically mark overdue status
    records = records.map((record) => {
      const recObj = record.toObject();
      if (recObj.status === 'Issued' && now > new Date(recObj.expectedReturnDate)) {
        recObj.isOverdue = true;
        recObj.overdueDays = Math.ceil((now - new Date(recObj.expectedReturnDate)) / (1000 * 60 * 60 * 24));
      } else {
        recObj.isOverdue = false;
        recObj.overdueDays = 0;
      }
      return recObj;
    });

    if (status && status !== 'All') {
      if (status === 'Overdue') {
        records = records.filter((r) => r.isOverdue);
      } else {
        records = records.filter((r) => r.status === status);
      }
    }

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving issue/return records',
      error: error.message,
    });
  }
};
