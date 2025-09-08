// 📁 backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const sendOTP = require('../utils/mailer'); // ✅ Use sendOTP from mailer.js

// Initialize SQLite DB
const db = new sqlite3.Database('./filemeta.db');

// Ensure users table exists
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
)`);

// Express-session middleware
router.use(session({
    secret: 'safetransfer-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 } // 10 mins
}));

// ✅ Signup Route (no OTP at signup)
router.post('/signup', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "❌ Email and password are required." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        (err) => {
            if (err) {
                if (err.message.includes("UNIQUE constraint")) {
                    return res.status(400).json({ success: false, message: "❌ User already exists." });
                }
                console.error("❌ Signup error:", err.message);
                return res.status(500).json({ success: false, message: "❌ Database error." });
            }
            res.json({ success: true, message: "✅ Signup successful. Please login." });
        }
    );
});

// ✅ Login Route with OTP
router.post('/login', (req, res) => {
    const { email, password, otp } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ success: false, message: "❌ Invalid email or user not found." });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "❌ Invalid password." });
        }

        // Step 1: send OTP
        if (!otp) {
            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            req.session.otp = generatedOTP;
            req.session.email = email;

            try {
                await sendOTP(email, generatedOTP);
                return res.json({ success: true, message: "✅ OTP sent to your email. Enter it to continue." });
            } catch (mailError) {
                console.error("❌ Error sending OTP:", mailError);
                return res.status(500).json({ success: false, message: "❌ Failed to send OTP." });
            }
        }

        // Step 2: validate OTP
        if (otp !== req.session.otp) {
            return res.status(401).json({ success: false, message: "❌ Invalid OTP." });
        }

        // Login success
        delete req.session.otp;
        res.json({ success: true, message: "✅ Login successful!" });
    });
});

module.exports = router;
