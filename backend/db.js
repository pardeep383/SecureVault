const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'filemeta.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Failed to connect to database:', err.message);
    } else {
        console.log('✅ Database connected: filemeta.db');
    }
});

// Create "files" table if not exists
db.run(`
    CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY,
        originalname TEXT NOT NULL,
        filepath TEXT NOT NULL,
        key TEXT NOT NULL,
        iv TEXT NOT NULL
    );
`);

module.exports = db;
