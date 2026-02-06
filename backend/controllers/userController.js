const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ success: true, users });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.createUser = async (req, res) => {
    try {
        await User.create(req.body);
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
