const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const db = require("../models/fileModel");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// AES encryption helper
function encryptBuffer(buffer, keyHex) {
    const key = Buffer.from(keyHex, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return { encrypted, iv: iv.toString('hex') };
}

// Upload route for multiple files
router.post("/upload", upload.array("file"), (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded." });
    }

    const uploadDate = Date.now();
    const expiryDate = uploadDate + 7 * 24 * 60 * 60 * 1000; // 7 days
    const uploadedFiles = [];

    let processed = 0;

    files.forEach(file => {
        const key = crypto.randomBytes(32).toString('hex'); // AES-256
        const { encrypted, iv } = encryptBuffer(file.buffer, key);

        const encryptedName = `enc-${Date.now()}-${file.originalname}`;
        const encryptedPath = path.join(__dirname, "../uploads", encryptedName);
        fs.writeFileSync(encryptedPath, encrypted);

        db.run(`
            INSERT INTO files (originalName, encryptedName, key, iv, uploadDate, expiryDate)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [file.originalname, encryptedName, key, iv, uploadDate, expiryDate], function (err) {
            if (err) {
                console.error("DB Error:", err.message);
                return;
            }

            const fileId = this.lastID;
            uploadedFiles.push({
                originalName: file.originalname,
                downloadLink: `http://localhost:3000/download/${fileId}`,
                decryptionKey: key
            });

            processed++;
            if (processed === files.length) {
                res.json({ files: uploadedFiles });
            }
        });
    });
});

module.exports = router;
