// 📁 backend/routes/download.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

const db = new sqlite3.Database('./filemeta.db');

// AES Decryption function
function decryptFile(encryptedPath, decryptedPath, keyHex, ivHex) {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const input = fs.createReadStream(encryptedPath);
    const output = fs.createWriteStream(decryptedPath);

    return new Promise((resolve, reject) => {
        input.pipe(decipher).pipe(output);
        output.on('finish', resolve);
        output.on('error', reject);
    });
}

// Route: /download/:id/:key
router.get('/download/:id/:key', async (req, res) => {
    const fileId = req.params.id;
    const key = req.params.key;

    if (!fileId || !key) {
        return res.status(400).send("❌ Missing file ID or decryption key");
    }

    db.get("SELECT * FROM files WHERE id = ?", [fileId], async (err, row) => {
        if (err) {
            console.error("❌ Database error:", err.message);
            return res.status(500).send("❌ Internal server error.");
        }

        if (!row) {
            return res.status(404).send("❌ File not found");
        }

        const encryptedPath = path.join(__dirname, '../uploads', row.encryptedName);
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const decryptedPath = path.join(tempDir, `decrypted-${row.originalName}`);
        const iv = row.iv;

        try {
            await decryptFile(encryptedPath, decryptedPath, key, iv);
            res.download(decryptedPath, row.originalName, (err) => {
                if (err) {
                    console.error("❌ Download failed:", err.message);
                }
                fs.unlink(decryptedPath, () => { }); // Auto delete after sending
            });
        } catch (decryptionError) {
            console.error("❌ Decryption failed:", decryptionError.message);
            res.status(400).send("❌ Decryption failed. Invalid key?");
        }
    });
});

module.exports = router;
