const User = require('../models/User');
const { logAudit } = require('../models/Audit');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ success: true, users });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.createUser = async (req, res) => {
    try {
        const { username, password, full_name, role } = req.body;

        if (!username || username.length < 3) return res.status(400).json({ success: false, error: 'Username must be at least 3 characters' });
        if (!password || password.length < 6) return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        if (!full_name || !role) return res.status(400).json({ success: false, error: 'Missing required fields' });

        const newUser = await User.create(req.body);
        if (req.session.user_id) {
            await logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'CREATE_USER', `Created user: ${req.body.username}, full name: ${req.body.full_name}, role: ${req.body.role}`);
        }
        res.json({ success: true });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY' || e.code === 11000) return res.json({ success: false, error: 'Username already exists' });
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.updatePassword = async (req, res) => {
    const uid = req.params.uid; // MongoDB ID is string
    if (req.session.role !== 'admin' && req.session.user_id !== uid) {
        return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (!req.body.new_password || req.body.new_password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    try {
        await User.updatePassword(uid, req.body.new_password);
        if (req.session.user_id) {
            await logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'UPDATE_PASSWORD', `Updated password for user ID ${uid}`);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.updateUser = async (req, res) => {
    const uid = req.params.uid;
    try {
        await User.update(uid, req.body);

        if (req.session.user_id) {
            const { password, ...safeData } = req.body;
            await logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'UPDATE_USER', `Updated user ID ${uid}: ${JSON.stringify(safeData)}`);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.deleteUser = async (req, res) => {
    const uid = req.params.uid;
    try {
        await User.delete(uid);
        if (req.session.user_id) {
            await logAudit(req.session.user_id, req.session.username, req.session.full_name, req.session.role, 'DELETE_USER', `Deleted user ID ${uid}`);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
