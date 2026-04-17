const orderService = require('../services/order.service');
const { GARMENT_PRICES } = require('../constants/garments');

/**
 * POST /api/v1/orders — Create a new order
 */
const createOrder = async (req, res, next) => {
  try {
    const { customerName, phoneNumber, garments } = req.body;
    const order = await orderService.createOrder({
      customerName,
      phoneNumber,
      garments,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/orders/:orderId/status — Update order status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(orderId, status);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders — List all orders (with filters + pagination)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);

    res.status(200).json({
      success: true,
      pagination: result.pagination,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/:orderId — Get single order by ID
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.orderId);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/garments — Return the garment price list
 */
const getGarmentPrices = (req, res) => {
  res.status(200).json({
    success: true,
    data: GARMENT_PRICES,
  });
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderById,
  getGarmentPrices,
};
