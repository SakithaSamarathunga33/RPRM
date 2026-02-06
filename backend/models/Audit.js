const { AuditLog } = require('../schemas');

const logAudit = async (userId, username, action, details = null) => {
    try {
        await AuditLog.create({
            user_id: userId,
            username: username,
            action: action,
            details: details,
            timestamp: new Date()
        });
    } catch (e) {
        console.error("Audit log failed:", e);
    }
};

module.exports = { logAudit };
