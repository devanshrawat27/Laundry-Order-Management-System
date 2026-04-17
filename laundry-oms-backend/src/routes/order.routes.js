const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const basicAuth = require('../middleware/auth');
const {
  validateCreateOrder,
  validateUpdateStatus,
} = require('../middleware/validate');

// POST   /api/v1/orders              → Create Order
router.post('/', basicAuth, validateCreateOrder, orderCtrl.createOrder);

// GET    /api/v1/orders              → List Orders (with filters + pagination)
router.get('/', orderCtrl.getAllOrders);

// GET    /api/v1/orders/:orderId     → Get single Order
router.get('/:orderId', orderCtrl.getOrderById);

// PATCH  /api/v1/orders/:orderId/status → Update Order Status
router.patch('/:orderId/status', basicAuth, validateUpdateStatus, orderCtrl.updateOrderStatus);

module.exports = router;
