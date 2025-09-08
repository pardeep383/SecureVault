// 📄 backend/models/fileModel.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ✅ Connect to or create the SQLite database file
const db = new sqlite3.Database(path.join(__dirname, '../filemeta.db'), (err) => {
    if (err) {
        console.error("❌ Could not connect to database:", err);
    } else {
        console.log("✅ Connected to SQLite database: filemeta.db");
    }
});

// ✅ Create the files table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            originalName TEXT NOT NULL,
            encryptedName TEXT NOT NULL,
            key TEXT NOT NULL,
            iv TEXT NOT NULL,
            uploadDate INTEGER NOT NULL,
            expiryDate INTEGER NOT NULL,
            downloadCount INTEGER DEFAULT 0
        );
    `, (err) => {
        if (err) {
            console.error("❌ Failed to create files table:", err);
        } else {
            console.log("✅ Files table ensured.");
        }
    });
});

module.exports = db;
