require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const orderRoutes = require('./routes/order.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { GARMENT_PRICES } = require('./constants/garments');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─── MongoDB Connection Check Middleware ──────────────────────────────────────
app.use((req, res, next) => {
  const mongooseConnection = require('mongoose').connection;
  if (mongooseConnection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection lost. Please try again in a moment.',
    });
  }
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🧺 Laundry OMS API is running',
    version: '1.0.0',
    endpoints: {
      orders: '/api/v1/orders',
      garments: '/api/v1/garments',
      dashboard: '/api/v1/dashboard',
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// GET /api/v1/garments — Price list (simple, no controller needed)
app.get('/api/v1/garments', (req, res) => {
  res.json({ success: true, data: GARMENT_PRICES });
});

// ─── 404 Catch-All ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Laundry OMS API running on http://localhost:${PORT}`);
      console.log(`📋 API base: http://localhost:${PORT}/api/v1`);
      console.log(`🧪 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:');
    console.error(`   ${error.message}`);
    console.error('\n📌 Troubleshooting:');
    console.error(
      '   1. Check if MONGODB_URI is correct in your .env file'
    );
    console.error(
      '   2. Ensure MongoDB Atlas IP whitelist includes your IP'
    );
    console.error(
      '   3. Verify your MongoDB credentials (username/password)'
    );
    console.error('   4. Check your internet connection\n');
    process.exit(1);
  }
};

startServer();

module.exports = app;
