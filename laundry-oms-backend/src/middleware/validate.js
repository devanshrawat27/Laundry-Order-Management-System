const { body, param, validationResult } = require('express-validator');
const { VALID_GARMENT_TYPES, ORDER_STATUSES } = require('../constants/garments');

/**
 * Middleware that checks express-validator results and returns 400 on failure.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/**
 * Validation rules for POST /orders — Create Order
 */
const validateCreateOrder = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2 })
    .withMessage('Customer name must be at least 2 characters'),

  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),

  body('garments')
    .isArray({ min: 1 })
    .withMessage('At least one garment is required'),

  body('garments.*.type')
    .notEmpty()
    .withMessage('Garment type is required')
    .isIn(VALID_GARMENT_TYPES)
    .withMessage(
      `Garment type must be one of: ${VALID_GARMENT_TYPES.join(', ')}`
    ),

  body('garments.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer ≥ 1'),

  handleValidationErrors,
];

/**
 * Validation rules for PATCH /orders/:orderId/status — Update Status
 */
const validateUpdateStatus = [
  param('orderId')
    .notEmpty()
    .withMessage('Order ID is required'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(ORDER_STATUSES)
    .withMessage(
      `Status must be one of: ${ORDER_STATUSES.join(', ')}`
    ),

  handleValidationErrors,
];

module.exports = {
  validateCreateOrder,
  validateUpdateStatus,
  handleValidationErrors,
};
