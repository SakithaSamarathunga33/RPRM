const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        let uri = process.env.DATABASE_URL;
        if (!uri) throw new Error("DATABASE_URL is missing in .env");

        // Append authSource=admin if not present for Railway/Docker setups
        if (!uri.includes('?')) uri += '?authSource=admin';
        else if (!uri.includes('authSource')) uri += '&authSource=admin';
        if (!uri) throw new Error("DATABASE_URL is missing in .env");

        // Log masked URI for debugging
        const masked = uri.includes('@') ? uri.replace(/:[^:@]*@/, ':****@') : 'Using Local/Internal URI';
        console.log("Connecting to MongoDB:", masked);

        await mongoose.connect(uri);
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Do not exit process, so the app remains running (might recover if DB comes up)
    }
};

module.exports = { connectDB, mongoose };
