const Asset = require('../models/Asset');
const InventoryItem = require('../models/InventoryItem');
const IssueReturn = require('../models/IssueReturn');
const Maintenance = require('../models/Maintenance');
const AuditLog = require('../models/AuditLog');
const StockTransaction = require('../models/StockTransaction');

// @desc    Get real-time aggregated dashboard summary and chart data
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardMetrics = async (req, res) => {
  try {
    const now = new Date();

    // 1. Asset status counts
    const totalAssets = await Asset.countDocuments();
    const availableAssets = await Asset.countDocuments({ status: 'Available' });
    const issuedAssets = await Asset.countDocuments({ status: 'Issued' });
    const underMaintenanceAssets = await Asset.countDocuments({ status: 'Under Maintenance' });
    const damagedAssets = await Asset.countDocuments({ status: 'Damaged' });

    // 2. Inventory counts
    const totalInventoryItems = await InventoryItem.countDocuments();
    const allInventory = await InventoryItem.find();
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    allInventory.forEach((item) => {
      if (item.quantity <= 0) {
        outOfStockCount++;
      } else if (item.quantity <= item.minStockLevel) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    // 3. Overdue Returns
    const overdueReturnsCount = await IssueReturn.countDocuments({
      status: 'Issued',
      expectedReturnDate: { $lt: now },
    });

    // 4. Assets by Category Aggregation
    const assetsByCategory = await Asset.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
      { $sort: { value: -1 } },
    ]);

    // 5. Assets by Department Aggregation
    const assetsByDepartment = await Asset.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: '$count', _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // 6. Maintenance Status Breakdown
    const maintenanceBreakdown = await Maintenance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: '$count', _id: 0 } },
    ]);

    // 7. Recent Activities (recent audit logs)
    const recentActivities = await AuditLog.find().sort({ createdAt: -1 }).limit(10);

    // 8. Recent Checkouts
    const recentIssues = await IssueReturn.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalAssets,
          availableAssets,
          issuedAssets,
          underMaintenanceAssets,
          damagedAssets,
          totalInventoryItems,
          lowStockCount,
          outOfStockCount,
          overdueReturnsCount,
        },
        charts: {
          assetsByCategory,
          assetsByDepartment,
          inventoryStatus: [
            { name: 'In Stock', value: inStockCount, color: '#10b981' },
            { name: 'Low Stock', value: lowStockCount, color: '#f59e0b' },
            { name: 'Out of Stock', value: outOfStockCount, color: '#ef4444' },
          ],
          maintenanceBreakdown,
        },
        recentActivities,
        recentIssues,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error aggregating dashboard metrics',
      error: error.message,
    });
  }
};

// @desc    Get detailed Asset valuation & status report
// @route   GET /api/reports/assets
// @access  Private
exports.getAssetReport = async (req, res) => {
  try {
    const { department, category, status } = req.query;

    let query = {};
    if (department && department !== 'All') query.department = department;
    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;

    const assets = await Asset.find(query).sort({ assetId: 1 });

    const totalValue = assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalAssets: assets.length,
        totalValuation: totalValue,
        assets,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating asset report',
      error: error.message,
    });
  }
};

// @desc    Get detailed Inventory stock report
// @route   GET /api/reports/inventory
// @access  Private
exports.getInventoryReport = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;

    const items = await InventoryItem.find(query).sort({ name: 1 });

    let totalStockValue = 0;
    let lowStockItems = [];
    let outOfStockItems = [];

    items.forEach((item) => {
      totalStockValue += (item.quantity || 0) * (item.unitCost || 0);
      if (item.quantity <= 0) {
        outOfStockItems.push(item);
      } else if (item.quantity <= item.minStockLevel) {
        lowStockItems.push(item);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalItems: items.length,
        totalStockValue,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        items,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating inventory report',
      error: error.message,
    });
  }
};

// @desc    Get Maintenance expenditure & breakdown report
// @route   GET /api/reports/maintenance
// @access  Private
exports.getMaintenanceReport = async (req, res) => {
  try {
    const records = await Maintenance.find().sort({ scheduledDate: -1 });

    const totalExpense = records.reduce((sum, r) => sum + (r.cost || 0), 0);
    const completedCount = records.filter((r) => r.status === 'Completed').length;
    const pendingCount = records.filter((r) => r.status === 'Scheduled' || r.status === 'In Progress').length;

    res.status(200).json({
      success: true,
      data: {
        totalRecords: records.length,
        totalExpense,
        completedCount,
        pendingCount,
        records,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating maintenance report',
      error: error.message,
    });
  }
};
