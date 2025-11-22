const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const receiptRoutes = require('./routes/receipts');
const deliveryRoutes = require('./routes/deliveries');
const transferRoutes = require('./routes/transfers');
const adjustmentRoutes = require('./routes/adjustments');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'frontend/static/css')));
app.use('/js', express.static(path.join(__dirname, 'frontend/static/js')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', receiptRoutes);
app.use('/api', deliveryRoutes);
app.use('/api', transferRoutes);
app.use('/api', adjustmentRoutes);
app.use('/api', dashboardRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/templates/login.html'));
});

app.get('/*.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/templates', req.params[0] + '.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 StockMaster server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
});

module.exports = app;
