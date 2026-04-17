const Order = require('../models/Order.model');
const { GARMENT_PRICES, STATUS_TRANSITIONS } = require('../constants/garments');
const { AppError } = require('../middleware/errorHandler');
const { isInMemory } = require('../config/db');

// ─── In-Memory Fallback Store ─────────────────────────────────────────────────
let inMemoryOrders = [];
let inMemoryCounter = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate an order ID in format ORD-YYYYMMDD-XXXX
 * Per PRD Section 6 — collision-safe for up to 9999 orders/day.
 */
const generateOrderId = async () => {
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  let count;

  if (isInMemory()) {
    inMemoryCounter[dateStr] = (inMemoryCounter[dateStr] || 0) + 1;
    count = inMemoryCounter[dateStr];
  } else {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    count = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });
    count += 1;
  }

  return `ORD-${dateStr}-${String(count).padStart(4, '0')}`;
};

/**
 * Compute garment line items with pricing from config.
 * Applies optional PRICE_MARKUP from env.
 */
const computeGarments = (garments) => {
  const markup = parseFloat(process.env.PRICE_MARKUP || '0') / 100;

  return garments.map((g) => {
    const basePrice = GARMENT_PRICES[g.type];
    if (!basePrice) {
      throw new AppError(`Unknown garment type: ${g.type}`, 400);
    }
    const pricePerItem = Math.round(basePrice * (1 + markup));
    const subtotal = pricePerItem * g.quantity;
    return {
      type: g.type,
      quantity: g.quantity,
      pricePerItem,
      subtotal,
    };
  });
};

// ─── Service Methods ──────────────────────────────────────────────────────────

/**
 * Create a new order.
 */
const createOrder = async ({ customerName, phoneNumber, garments }) => {
  // Duplicate detection — same phone + same garments within 5 minutes → 409
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

  if (!isInMemory()) {
    const duplicate = await Order.findOne({
      phoneNumber,
      createdAt: { $gte: fiveMinAgo },
      'garments.type': { $all: garments.map((g) => g.type) },
    });
    if (duplicate) {
      throw new AppError(
        'Duplicate order detected. Same phone and garments submitted within 5 minutes.',
        409
      );
    }
  } else {
    const duplicate = inMemoryOrders.find(
      (o) =>
        o.phoneNumber === phoneNumber &&
        new Date(o.createdAt) >= fiveMinAgo &&
        garments.every((g) => o.garments.some((og) => og.type === g.type))
    );
    if (duplicate) {
      throw new AppError(
        'Duplicate order detected. Same phone and garments submitted within 5 minutes.',
        409
      );
    }
  }

  const orderId = await generateOrderId();
  const computedGarments = computeGarments(garments);
  const totalBill = computedGarments.reduce((sum, g) => sum + g.subtotal, 0);

  const deliveryDays = parseInt(process.env.DELIVERY_DAYS || '2', 10);
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);

  const orderData = {
    orderId,
    customerName,
    phoneNumber,
    garments: computedGarments,
    totalBill,
    status: 'RECEIVED',
    estimatedDelivery,
    statusHistory: [],
  };

  if (isInMemory()) {
    const now = new Date();
    orderData.createdAt = now;
    orderData.updatedAt = now;
    inMemoryOrders.push(orderData);
    return orderData;
  }

  const order = await Order.create(orderData);
  return order.toObject();
};

/**
 * Update order status with forward-only transition validation.
 */
const updateOrderStatus = async (orderId, newStatus) => {
  let order;

  if (isInMemory()) {
    order = inMemoryOrders.find((o) => o.orderId === orderId);
  } else {
    order = await Order.findOne({ orderId });
  }

  if (!order) {
    throw new AppError(`Order ${orderId} not found`, 404);
  }

  const currentStatus = order.status;
  const allowed = STATUS_TRANSITIONS[currentStatus];

  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Invalid status transition: ${currentStatus} → ${newStatus}. Allowed: ${
        allowed.length ? allowed.join(', ') : 'none (order is already DELIVERED)'
      }`,
      400
    );
  }

  const historyEntry = {
    from: currentStatus,
    to: newStatus,
    changedAt: new Date(),
  };

  if (isInMemory()) {
    order.status = newStatus;
    order.statusHistory.push(historyEntry);
    order.updatedAt = new Date();
    return order;
  }

  order.status = newStatus;
  order.statusHistory.push(historyEntry);
  order.updatedAt = new Date();
  await order.save();
  return order.toObject();
};

/**
 * Get all orders with filters and pagination.
 * Supports: status, customerName (partial), phone (exact), garmentType (bonus), page, limit.
 */
const getAllOrders = async (query) => {
  const {
    status,
    customerName,
    phone,
    garmentType,
    page = 1,
    limit = 10,
  } = query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  if (isInMemory()) {
    let filtered = [...inMemoryOrders];

    if (status) filtered = filtered.filter((o) => o.status === status);
    if (customerName) {
      const regex = new RegExp(customerName, 'i');
      filtered = filtered.filter((o) => regex.test(o.customerName));
    }
    if (phone) filtered = filtered.filter((o) => o.phoneNumber === phone);
    if (garmentType) {
      filtered = filtered.filter((o) =>
        o.garments.some((g) => g.type === garmentType)
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = filtered.length;
    const data = filtered.slice(skip, skip + limitNum);

    return {
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data,
    };
  }

  // MongoDB query
  const filter = {};
  if (status) filter.status = status;
  if (customerName) filter.customerName = new RegExp(customerName, 'i');
  if (phone) filter.phoneNumber = phone;
  if (garmentType) filter['garments.type'] = garmentType;

  const [total, data] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  return {
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
    data,
  };
};

/**
 * Get a single order by its orderId.
 */
const getOrderById = async (orderId) => {
  let order;

  if (isInMemory()) {
    order = inMemoryOrders.find((o) => o.orderId === orderId);
  } else {
    order = await Order.findOne({ orderId }).lean();
  }

  if (!order) {
    throw new AppError(`Order ${orderId} not found`, 404);
  }

  return order;
};

/**
 * Dashboard aggregation — totals, revenue, breakdown by status, recent & today.
 */
const getDashboardSummary = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (isInMemory()) {
    const orders = inMemoryOrders;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + o.totalBill, 0);

    const ordersByStatus = { RECEIVED: 0, PROCESSING: 0, READY: 0, DELIVERED: 0 };
    orders.forEach((o) => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });

    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt) >= startOfToday
    );
    const todayRevenue = todayOrders.reduce((s, o) => s + o.totalBill, 0);

    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const recentOrders = sorted.slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders,
      todayOrders: todayOrders.length,
      todayRevenue,
    };
  }

  // MongoDB aggregation
  const [totals, statusBreakdown, recentOrders, todayAgg] = await Promise.all([
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalBill' },
        },
      },
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      {
        $group: {
          _id: null,
          todayOrders: { $sum: 1 },
          todayRevenue: { $sum: '$totalBill' },
        },
      },
    ]),
  ]);

  const ordersByStatus = { RECEIVED: 0, PROCESSING: 0, READY: 0, DELIVERED: 0 };
  statusBreakdown.forEach((s) => {
    ordersByStatus[s._id] = s.count;
  });

  return {
    totalOrders: totals[0]?.totalOrders || 0,
    totalRevenue: totals[0]?.totalRevenue || 0,
    ordersByStatus,
    recentOrders,
    todayOrders: todayAgg[0]?.todayOrders || 0,
    todayRevenue: todayAgg[0]?.todayRevenue || 0,
  };
};

const getCustomers = async () => {
  if (isInMemory()) {
    const customerMap = {};
    inMemoryOrders.forEach((o) => {
      const key = o.phoneNumber;
      if (!customerMap[key]) {
        customerMap[key] = {
          customerName: o.customerName,
          phoneNumber: o.phoneNumber,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: o.createdAt,
        };
      }
      customerMap[key].totalOrders += 1;
      customerMap[key].totalSpent += o.totalBill;
      if (new Date(o.createdAt) > new Date(customerMap[key].lastOrderDate)) {
        customerMap[key].lastOrderDate = o.createdAt;
      }
    });
    return Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
  }

  const customers = await Order.aggregate([
    {
      $group: {
        _id: '$phoneNumber',
        customerName: { $last: '$customerName' },
        phoneNumber: { $first: '$phoneNumber' },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalBill' },
        lastOrderDate: { $max: '$createdAt' }
      }
    },
    { $sort: { totalSpent: -1 } }
  ]);

  return customers;
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderById,
  getDashboardSummary,
  getCustomers,
};
