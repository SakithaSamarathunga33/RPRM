const { connectDB } = require('./db');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { createSessionStore } = require('./sessionManager');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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
const sessionStore = createSessionStore();
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore || undefined,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

const routes = require('./routes/index');
app.use('/api', routes);

app.listen(PORT, async () => {
    // Explicitly load .env if process.env.DATABASE_URL is missing
    if (!process.env.DATABASE_URL) require('dotenv').config();
    await connectDB();
    console.log(`Backend running on port ${PORT}`);
});
