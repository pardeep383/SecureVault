const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// ✅ Landing page override must come FIRST
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

// Serve static files (css, js, html, images…)
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const downloadRoutes = require('./routes/download');
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/', uploadRoutes);
app.use('/', downloadRoutes);
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
