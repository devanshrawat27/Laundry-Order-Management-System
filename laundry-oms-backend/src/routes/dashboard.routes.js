const express = require('express');
const router = express.Router();
const dashboardCtrl = require('../controllers/dashboard.controller');

// GET /api/v1/dashboard → Summary Stats
router.get('/', dashboardCtrl.getDashboard);

// GET /api/v1/dashboard/customers → Customers List
router.get('/customers', dashboardCtrl.getCustomers);

module.exports = router;
