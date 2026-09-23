const AuditLog = require('../models/AuditLog');

const logAudit = async ({ user, req, action, module, recordId, description }) => {
  try {
    const ipAddress = req ? req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress : '127.0.0.1';
    const currentUser = user || (req && req.user);

    await AuditLog.create({
      user: currentUser ? currentUser._id : null,
      userName: currentUser ? currentUser.name : 'System',
      userRole: currentUser ? currentUser.role : 'system',
      action,
      module,
      recordId: recordId ? String(recordId) : undefined,
      description,
      ipAddress,
    });
  } catch (err) {
    // Log silently to avoid breaking the main application transaction
    console.error('[Audit Log Error]:', err.message);
  }
};

module.exports = { logAudit };
