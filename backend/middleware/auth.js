function isAuthenticated(req, res, next) {
    if (req.session.user_id) return next();
    res.status(401).json({ success: false, error: 'Not authenticated' });
}

function isAdmin(req, res, next) {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
}

module.exports = { isAuthenticated, isAdmin };
