const { AuditLog } = require('../schemas');

/**
 * Log an audit entry.
 * @param {string|ObjectId} userId - ID of the user who performed the action
 * @param {string} username - Username of the actor
 * @param {string} [fullName] - Full name of the actor (shown in User column)
 * @param {string} [role] - Role of the actor (admin, manager, etc.)
 * @param {string} action - Action code (e.g. UPDATE_SETTINGS, CREATE_USER)
 * @param {string} [details] - Human-readable details of what changed
 */
const logAudit = async (userId, username, fullName, role, action, details = null) => {
    try {
        await AuditLog.create({
            user_id: userId,
            username: username || '',
            actor_full_name: fullName || '',
            actor_role: role || '',
            action: action,
            details: details != null ? String(details) : '',
            timestamp: new Date()
        });
    } catch (e) {
        console.error("Audit log failed:", e);
    }
};

module.exports = { logAudit };
