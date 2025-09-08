// 📁 backend/server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import route files
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const downloadRoutes = require('./routes/download'); // ✅ Must match filename download.js
const adminRoutes = require('./routes/admin'); // ✅ NEW

// Mount routes
app.use('/', authRoutes);
app.use('/', uploadRoutes);
app.use('/', downloadRoutes);
app.use('/admin', adminRoutes); // ✅ NEW

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
