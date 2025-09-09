// 📁 backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const sendOTP = require('../utils/mailer'); // keep if you use email OTP

// Use env path if provided (helpful for tests), else default
const DB_PATH = process.env.DB_PATH || './filemeta.db';

// Initialize SQLite DB
const db = new sqlite3.Database(DB_PATH);

// Ensure table exists with first/last names
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName  TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// Best-effort add columns if table existed without them (ignore errors)
db.run(`ALTER TABLE users ADD COLUMN firstName TEXT`, () => { });
db.run(`ALTER TABLE users ADD COLUMN lastName  TEXT`, () => { });

// Session middleware (router-scoped)
router.use(session({
    secret: 'safetransfer-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 } // 10 mins
}));

// ==========================
// SIGNUP
// ==========================
router.post('/signup', (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: '❌ All fields are required.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const normEmail = String(email).trim().toLowerCase();

    db.run(
        `INSERT INTO users (firstName, lastName, email, password)
     VALUES (?, ?, ?, ?)`,
        [firstName.trim(), lastName.trim(), normEmail, hashedPassword],
        function (err) {
            if (err) {
                if (String(err.message).includes('UNIQUE')) {
                    return res.status(400).json({ success: false, message: '❌ Email already registered.' });
                }
                console.error('❌ Signup error:', err.message);
                return res.status(500).json({ success: false, message: '❌ Database error.' });
            }
            return res.json({ success: true, message: '✅ Signup successful. Please login.' });
        }
    );
});

// ==========================
// LOGIN (two-step with optional OTP)
// Frontend should POST email+password first; if success w/o otp it sends OTP.
// Then POST again with same email+password+otp to finalize.
// ==========================
router.post('/login', (req, res) => {
    const { email, password, otp } = req.body;
    const normEmail = String(email || '').trim().toLowerCase();

    db.get(`SELECT * FROM users WHERE email = ?`, [normEmail], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ success: false, message: '❌ Invalid email or user not found.' });
        }

        const isPasswordValid = bcrypt.compareSync(password || '', user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: '❌ Invalid password.' });
        }

        // First step: no OTP provided yet → generate and send
        if (!otp) {
            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            req.session.otp = generatedOTP;
            req.session.email = user.email;
            req.session.user = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            };

            try {
                // If you don't want to actually email during demo, you can comment this out
                await sendOTP(user.email, generatedOTP);
                return res.json({ success: true, message: '✅ OTP sent to your email. Enter it to continue.' });
            } catch (mailError) {
                console.error('❌ Error sending OTP:', mailError);
                return res.status(500).json({ success: false, message: '❌ Failed to send OTP.' });
            }
        }

        // Second step: validate OTP
        if (otp !== req.session.otp) {
            return res.status(401).json({ success: false, message: '❌ Invalid OTP.' });
        }

        // Success: clear OTP but keep user session
        delete req.session.otp;
        return res.json({ success: true, message: '✅ Login successful!' });
    });
});

module.exports = router;
