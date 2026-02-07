const { connectDB } = require('./db');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createSessionStore } = require('./sessionManager');
const { verifyJwt } = require('./jwtAuth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Rate limit: per-IP cap to avoid abuse; high default so cashiers/managers aren't blocked (e.g. 1000/15min ≈ 66/min)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 1000,
    message: { success: false, error: 'Too many requests. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors({
    origin: ['https://rprm-production.up.railway.app', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Security Headers
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Session (persistent store via session manager when DATABASE_URL is set)
// Trust proxy for Railway/Heroku deployments (required for secure cookies behind reverse proxy)
app.set('trust proxy', 1);

const sessionStore = createSessionStore();
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret',
    name: 'rprm.sid', // Explicit session cookie name
    resave: false,
    saveUninitialized: false,
    store: sessionStore || undefined,
    cookie: {
        secure: isProduction, // HTTPS only in production (required for SameSite=None in Chrome)
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin cookies
        path: '/', // Explicit path
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        // Don't set domain - let browser handle it for cross-origin cookies
    }
}));

// Allow auth via JWT Bearer token (fixes Chrome cross-origin cookie blocking)
app.use((req, res, next) => {
    if (req.session.user_id) return next();
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return next();
    const payload = verifyJwt(token);
    if (payload) {
        req.session.user_id = payload.userId;
        req.session.username = payload.username;
        req.session.full_name = payload.full_name;
        req.session.role = payload.role;
    }
    next();
});

const routes = require('./routes/index');
app.use('/api', apiLimiter, routes);

app.listen(PORT, async () => {
    // Explicitly load .env if process.env.DATABASE_URL is missing
    if (!process.env.DATABASE_URL) require('dotenv').config();
    await connectDB();
    console.log(`Backend running on port ${PORT}`);
});
