const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const Notification = require('../models/Notification');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Get all maintenance records with filters
// @route   GET /api/maintenance
// @access  Private
exports.getMaintenanceRecords = async (req, res) => {
  try {
    const { status, maintenanceType, search } = req.query;

    let query = {};
    if (status && status !== 'All') query.status = status;
    if (maintenanceType && maintenanceType !== 'All') query.maintenanceType = maintenanceType;

    if (search) {
      query.$or = [
        { maintenanceId: { $regex: search, $options: 'i' } },
        { assetName: { $regex: search, $options: 'i' } },
        { assetId: { $regex: search, $options: 'i' } },
        { technician: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const records = await Maintenance.find(query).sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving maintenance records',
      error: error.message,
    });
  }
};

// @desc    Schedule a new maintenance task
// @route   POST /api/maintenance
// @access  Private (Admin, Lab Staff)
exports.createMaintenance = async (req, res) => {
  try {
    const { assetId, maintenanceType, scheduledDate, technician, description, cost, remarks } = req.body;

    if (!assetId || !scheduledDate || !description) {
      return res.status(400).json({
        success: false,
        message: 'Asset, scheduled date, and description are required.',
      });
    }

    let asset;
    if (assetId.match(/^[0-9a-fA-F]{24}$/)) {
      asset = await Asset.findById(assetId);
    } else {
      asset = await Asset.findOne({ assetId: assetId.toUpperCase() });
    }

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    const count = await Maintenance.countDocuments();
    const maintenanceId = `MNT-${String(count + 1).padStart(4, '0')}`;

    const record = await Maintenance.create({
      maintenanceId,
      asset: asset._id,
      assetId: asset.assetId,
      assetName: asset.name,
      maintenanceType: maintenanceType || 'Preventive',
      scheduledDate: new Date(scheduledDate),
      technician: technician || 'In-House Technician',
      description,
      cost: cost ? Number(cost) : 0,
      remarks,
      status: 'Scheduled',
      createdBy: req.user._id,
    });

    // Update asset status to Under Maintenance
    asset.status = 'Under Maintenance';
    await asset.save();

    await logAudit({
      user: req.user,
      req,
      action: 'SCHEDULE_MAINTENANCE',
      module: 'Maintenance',
      recordId: maintenanceId,
      description: `Scheduled ${maintenanceType || 'Preventive'} maintenance for ${asset.name} (${asset.assetId}). Technician: ${technician || 'In-House'}.`,
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance scheduled successfully.',
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error scheduling maintenance',
      error: error.message,
    });
  }
};

// @desc    Update maintenance record status/cost/completion
// @route   PUT /api/maintenance/:id
// @access  Private (Admin, Lab Staff)
exports.updateMaintenance = async (req, res) => {
  try {
    let record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found',
      });
    }

    const { status, completedDate, cost, technician, remarks, assetCondition } = req.body;

    const previousStatus = record.status;
    if (status) record.status = status;
    if (completedDate) record.completedDate = new Date(completedDate);
    if (cost !== undefined) record.cost = Number(cost);
    if (technician) record.technician = technician;
    if (remarks) record.remarks = remarks;

    if (status === 'Completed' && !record.completedDate) {
      record.completedDate = new Date();
    }

    await record.save();

    // If maintenance was marked Completed or Cancelled, restore asset status to Available
    if (status === 'Completed' || status === 'Cancelled') {
      const activeOtherMaintenance = await Maintenance.findOne({
        asset: record.asset,
        _id: { $ne: record._id },
        status: { $in: ['Scheduled', 'In Progress'] },
      });

      if (!activeOtherMaintenance) {
        const asset = await Asset.findById(record.asset);
        if (asset) {
          asset.status = 'Available';
          if (assetCondition) {
            asset.condition = assetCondition;
          }
          await asset.save();
        }
      }

      if (status === 'Completed') {
        await Notification.create({
          title: 'Maintenance Completed',
          message: `Maintenance ${record.maintenanceId} for ${record.assetName} (${record.assetId}) was completed successfully.`,
          type: 'maintenance',
          referenceId: record.maintenanceId,
          referenceModel: 'Maintenance',
          targetRoles: ['admin', 'lab_staff'],
        });
      }
    } else if (status === 'In Progress') {
      const asset = await Asset.findById(record.asset);
      if (asset) {
        asset.status = 'Under Maintenance';
        await asset.save();
      }
    }

    await logAudit({
      user: req.user,
      req,
      action: 'UPDATE_MAINTENANCE',
      module: 'Maintenance',
      recordId: record.maintenanceId,
      description: `Updated maintenance ${record.maintenanceId} for ${record.assetName}: status changed from ${previousStatus} to ${record.status}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully.',
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating maintenance record',
      error: error.message,
    });
  }
};
