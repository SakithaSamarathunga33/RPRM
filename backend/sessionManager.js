/**
 * Session manager: configures persistent session store and optional session utilities.
 * Sessions are stored in MongoDB so they survive server restarts.
 */

const connectMongo = require('connect-mongo');
// connect-mongo may export as default (ESM interop) or as .MongoStore
const MongoStore = connectMongo.MongoStore || connectMongo.default || connectMongo;

/**
 * Create MongoDB session store for express-session.
 * Uses DATABASE_URL from env (same as main app). Call after dotenv is loaded.
 */
function createSessionStore() {
    const mongoUrl = process.env.DATABASE_URL;
    if (!mongoUrl) {
        console.warn('SESSION_STORE: DATABASE_URL not set; sessions will use memory store (not persistent).');
        return undefined;
    }
    const store = MongoStore.create({
        mongoUrl,
        dbName: process.env.SESSION_DB_NAME || undefined, // use default DB from URL
        collectionName: process.env.SESSION_COLLECTION || 'sessions',
        ttl: process.env.SESSION_TTL_SECONDS ? parseInt(process.env.SESSION_TTL_SECONDS, 10) : 24 * 60 * 60, // 1 day
        autoRemove: 'interval',
        autoRemoveInterval: 10, // minutes
        touchAfter: 24 * 3600, // time period in seconds
    });
    store.on('error', (err) => console.error('Session store error:', err));
    return store;
}

module.exports = { createSessionStore };
