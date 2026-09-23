const AuditLog = require('../models/AuditLog');

// @desc    Get audit trail logs
// @route   GET /api/audit-logs
// @access  Private (Admin Only)
exports.getAuditLogs = async (req, res) => {
  try {
    const { module: moduleName, action, search, limit } = req.query;

    let query = {};
    if (moduleName && moduleName !== 'All') query.module = moduleName;
    if (action && action !== 'All') query.action = action;

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { recordId: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const maxResults = limit ? parseInt(limit, 10) : 100;
    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(maxResults);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message,
    });
  }
};
