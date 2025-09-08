const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./filemeta.db');


db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      otp TEXT,
      otp_expiry INTEGER
    );
  `);
    console.log("✅ Users table ready.");
});

module.exports = db;
