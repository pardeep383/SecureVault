// 📁 backend/routes/admin.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./filemeta.db');
const router = express.Router();

// Hardcoded admin credentials
const ADMIN_EMAIL = "hanspardeep04@gmail.com";
const ADMIN_PASSWORD = "Pardeep2004@";

// Admin login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        return res.json({ success: true, message: "✅ Login successful", redirect: "/admin_dashboard.html" });
    } else {
        return res.status(401).json({ success: false, message: "❌ Invalid credentials" });
    }
});

// API to fetch all uploaded files
router.get('/files', (req, res) => {
    const query = `
        SELECT id, originalName, uploadDate, key
        FROM files
        ORDER BY uploadDate DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("❌ DB error:", err.message);
            return res.status(500).json({ error: "Database error" });
        }

        const formatted = rows.map(row => ({
            id: row.id,
            originalName: row.originalName,
            uploadDate: row.uploadDate,
            downloadLink: `/download/${row.id}/${row.key}`
        }));

        res.json({ files: formatted });
    });
});

module.exports = router;
