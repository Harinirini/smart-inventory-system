const Asset = require('../models/Asset');
const IssueReturn = require('../models/IssueReturn');
const Maintenance = require('../models/Maintenance');
const { generateAssetQRCode } = require('../utils/qrGenerator');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Get all assets with filters, search, sorting
// @route   GET /api/assets
// @access  Private
exports.getAssets = async (req, res) => {
  try {
    const { search, category, department, laboratory, status, condition, sortBy, order } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetId: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') query.category = category;
    if (department && department !== 'All') query.department = department;
    if (laboratory && laboratory !== 'All') query.laboratory = laboratory;
    if (status && status !== 'All') query.status = status;
    if (condition && condition !== 'All') query.condition = condition;

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const assets = await Asset.find(query).sort({ [sortField]: sortOrder });

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message,
    });
  }
};

// @desc    Get single asset by ID or assetId code
// @route   GET /api/assets/:id
// @access  Private
exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    let asset;

    // Check if ID is a valid MongoDB ObjectId or an Asset Code
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

    // Retrieve related history for this asset
    const issueHistory = await IssueReturn.find({ asset: asset._id }).sort({ createdAt: -1 });
    const maintenanceHistory = await Maintenance.find({ asset: asset._id }).sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...asset.toObject(),
        issueHistory,
        maintenanceHistory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching asset details',
      error: error.message,
    });
  }
};

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private (Admin, Lab Staff)
exports.createAsset = async (req, res) => {
  try {
    let { assetId } = req.body;

    // Auto-generate Asset ID if not provided
    if (!assetId) {
      const count = await Asset.countDocuments();
      assetId = `AST-${String(count + 1).padStart(4, '0')}`;
    }

    const existing = await Asset.findOne({ assetId: assetId.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Asset with ID '${assetId}' already exists.`,
      });
    }

    const assetData = {
      ...req.body,
      assetId: assetId.toUpperCase(),
    };

    // Generate QR code Data URL
    const qrCode = await generateAssetQRCode(assetData);
    assetData.qrCode = qrCode;

    const asset = await Asset.create(assetData);

    await logAudit({
      user: req.user,
      req,
      action: 'CREATE_ASSET',
      module: 'Asset',
      recordId: asset.assetId,
      description: `Registered new asset ${asset.name} (${asset.assetId}) in ${asset.department} - ${asset.laboratory}.`,
    });

    res.status(201).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating asset',
      error: error.message,
    });
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private (Admin, Lab Staff)
exports.updateAsset = async (req, res) => {
  try {
    let asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    // Role-based field restrictions: Store In-Charge cannot edit assets
    if (req.user.role === 'store_incharge') {
      return res.status(403).json({
        success: false,
        message: 'Store In-Charge does not have permission to modify asset registry.',
      });
    }

    const updateData = { ...req.body };

    // Regenerate QR code if essential identifying info changed
    if (
      updateData.name ||
      updateData.department ||
      updateData.category ||
      updateData.serialNumber
    ) {
      const merged = { ...asset.toObject(), ...updateData };
      updateData.qrCode = await generateAssetQRCode(merged);
    }

    asset = await Asset.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    await logAudit({
      user: req.user,
      req,
      action: 'UPDATE_ASSET',
      module: 'Asset',
      recordId: asset.assetId,
      description: `Updated details for asset ${asset.name} (${asset.assetId}). Status: ${asset.status}, Condition: ${asset.condition}.`,
    });

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating asset',
      error: error.message,
    });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin Only)
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    // Cannot delete an asset that is currently issued
    if (asset.status === 'Issued') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an asset that is currently issued to a student or staff member. Return the asset first.',
      });
    }

    await Asset.findByIdAndDelete(req.params.id);

    await logAudit({
      user: req.user,
      req,
      action: 'DELETE_ASSET',
      module: 'Asset',
      recordId: asset.assetId,
      description: `Deleted asset ${asset.name} (${asset.assetId}) from ${asset.department}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
      data: { id: req.params.id, assetId: asset.assetId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting asset',
      error: error.message,
    });
  }
};
