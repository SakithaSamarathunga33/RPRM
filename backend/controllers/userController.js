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
        const newUser = await User.create(req.body);
        if (req.session.user_id) {
            await logAudit(req.session.user_id, req.session.username, 'CREATE_USER', `Created user ${req.body.username} (${req.body.role})`);
        }
        res.json({ success: true });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') return res.json({ success: false, error: 'Username already exists' });
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.updatePassword = async (req, res) => {
    const uid = parseInt(req.params.uid);
    if (req.session.role !== 'admin' && req.session.user_id !== uid) {
        return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    try {
        await User.updatePassword(uid, req.body.new_password);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.updateUser = async (req, res) => {
    const uid = req.params.uid;
    try {
        await User.update(uid, req.body);
        if (req.session.user_id) {
            await logAudit(req.session.user_id, req.session.username, 'UPDATE_USER', `Updated user ID ${uid} with data: ${JSON.stringify(req.body)}`);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.deleteUser = async (req, res) => {
    const uid = req.params.uid;
    try {
        await User.delete(uid);
        if (req.session.user_id) {
            await logAudit(req.session.user_id, req.session.username, 'DELETE_USER', `Deleted user ID ${uid}`);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
