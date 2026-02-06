/**
 * JWT auth for Bearer token (fixes Chrome cross-origin cookie blocking).
 * Login returns a JWT; frontend sends it as Authorization: Bearer <token>.
 */

const jwt = require('jsonwebtoken');

const SECRET = process.env.SESSION_SECRET || 'dev_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'; // e.g. '24h', '7d', '30m'

/**
 * Create a JWT for the given user.
 * @param {{ id: number, username: string, full_name: string, role: string }} user
 * @returns {string|null}
 */
function createJwt(user) {
    if (!user || user.id == null) return null;
    try {
        return jwt.sign(
            {
                userId: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
            },
            SECRET,
            { expiresIn: EXPIRES_IN }
        );
    } catch (err) {
        console.error('JWT sign error:', err);
        return null;
    }
}

/**
 * Verify a JWT and return the payload (or null if invalid/expired).
 * @param {string} token
 * @returns {{ userId: number, username: string, full_name: string, role: string }|null}
 */
function verifyJwt(token) {
    if (!token || typeof token !== 'string') return null;
    try {
        const payload = jwt.verify(token, SECRET);
        if (payload && payload.userId != null) return payload;
        return null;
    } catch {
        return null;
    }
}

module.exports = { createJwt, verifyJwt };
