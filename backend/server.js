// 📁 backend/server.js
const express = require('express');
const path = require('path');
const app = express();

// Render provides its own PORT, fallback to 3000 locally
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Force landing page → signup.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

// Import route files
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const downloadRoutes = require('./routes/download');
const adminRoutes = require('./routes/admin');

// Mount routes
app.use('/', authRoutes);
app.use('/', uploadRoutes);
app.use('/', downloadRoutes);
app.use('/admin', adminRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
