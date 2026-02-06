/**
 * Signed session token for browsers that block cross-origin cookies (e.g. Chrome).
 * Login returns this token; frontend sends it as Authorization: Bearer <token>.
 */

const crypto = require('crypto');

const SECRET = process.env.SESSION_SECRET || 'dev_secret';
const SEP = '.';

function createSessionToken(sessionId) {
    if (!sessionId) return null;
    const hmac = crypto.createHmac('sha256', SECRET).update(sessionId).digest('base64url');
    return Buffer.from(sessionId, 'utf8').toString('base64url') + SEP + hmac;
}

function verifySessionToken(token) {
    if (!token || typeof token !== 'string') return null;
    const i = token.indexOf(SEP);
    if (i === -1) return null;
    const sessionId = Buffer.from(token.slice(0, i), 'base64url').toString('utf8');
    const expectedHmac = crypto.createHmac('sha256', SECRET).update(sessionId).digest('base64url');
    if (token.slice(i + 1) !== expectedHmac) return null;
    return sessionId;
}

module.exports = { createSessionToken, verifySessionToken };
