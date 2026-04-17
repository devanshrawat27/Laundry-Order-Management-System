const orderService = require('../services/order.service');

/**
 * GET /api/v1/dashboard — Dashboard summary stats
 */
const getDashboard = async (req, res, next) => {
  try {
    const summary = await orderService.getDashboardSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/dashboard/customers — Aggregated customer list
 */
const getCustomers = async (req, res, next) => {
  try {
    const customers = await orderService.getCustomers();
    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getCustomers };
