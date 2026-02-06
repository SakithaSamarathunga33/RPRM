const User = require('../models/User');
const bcrypt = require('bcrypt');
const { logAudit } = require('../models/Audit');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
            return res.status(400).json({ success: false, error: 'Invalid input' });
        }

        const user = await User.findByUsername(username);

        if (user && await bcrypt.compare(password, user.password_hash)) {
            // Regenerate session ID for security and Chrome compatibility
            req.session.regenerate((err) => {
                if (err) {
                    console.error('Session regenerate error:', err);
                    return res.status(500).json({ success: false, error: 'Session error' });
                }

                req.session.user_id = user.id;
                req.session.username = user.username;
                req.session.full_name = user.full_name;
                req.session.role = user.role;

                // Explicitly save session before responding to ensure cookie is set
                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                        return res.status(500).json({ success: false, error: 'Session error' });
                    }

                    User.updateLastLogin(user.id);
                    logAudit(user.id, user.username, 'LOGIN');

                    res.json({
                        success: true,
                        user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role }
                    });
                });
            });
        } else {
            res.json({ success: false, error: 'Invalid credentials' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.logout = (req, res) => {
    const uid = req.session.user_id;
    const uname = req.session.username;
    const reason = req.body?.reason || 'manual';

    req.session.destroy((err) => {
        if (uid) {
            if (reason === 'idle_timeout') {
                logAudit(uid, uname, 'AUTO_LOGOUT', 'Session expired due to inactivity');
            } else {
                logAudit(uid, uname, 'LOGOUT');
            }
        }
        res.json({ success: true });
    });
};

exports.getSession = (req, res) => {
    // Prevent caching of session checks
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    if (req.session.user_id) {
        res.json({
            success: true, authenticated: true,
            user: {
                id: req.session.user_id, username: req.session.username,
                full_name: req.session.full_name, role: req.session.role
            }
        });
    } else {
        res.json({ success: true, authenticated: false });
    }
};
