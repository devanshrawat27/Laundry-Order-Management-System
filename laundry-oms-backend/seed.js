require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order.model');

const dummyOrders = [
  {
    customerName: "Aditya Sharma",
    phoneNumber: "9812345678",
    garments: [
      { type: "SHIRT", quantity: 5, pricePerItem: 30, subtotal: 150 },
      { type: "PANTS", quantity: 2, pricePerItem: 40, subtotal: 80 }
    ],
    totalBill: 230,
    status: "READY",
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: "Sneha Kapoor",
    phoneNumber: "9123456789",
    garments: [
      { type: "SAREE", quantity: 2, pricePerItem: 80, subtotal: 160 },
      { type: "DRESS", quantity: 1, pricePerItem: 60, subtotal: 60 }
    ],
    totalBill: 220,
    status: "PROCESSING",
    estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: "Vikram Malhotra",
    phoneNumber: "8877665544",
    garments: [
      { type: "SUIT", quantity: 1, pricePerItem: 150, subtotal: 150 },
      { type: "SHIRT", quantity: 2, pricePerItem: 30, subtotal: 60 }
    ],
    totalBill: 210,
    status: "RECEIVED",
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: "Deepika Singh",
    phoneNumber: "7766554433",
    garments: [
      { type: "JACKET", quantity: 1, pricePerItem: 120, subtotal: 120 },
      { type: "BED_SHEET", quantity: 1, pricePerItem: 60, subtotal: 60 }
    ],
    totalBill: 180,
    status: "DELIVERED",
    estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

// Helper to generate IDs
const generateId = (index) => {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    return `ORD-${dateStr}-${String(index).padStart(4, '0')}`;
};

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB for seeding...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected.");

    // Fill in extra missing fields
    const ordersToInsert = dummyOrders.map((o, index) => ({
      ...o,
      orderId: generateId(index + 10), // start from 10 to avoid collisions
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: o.status === 'RECEIVED' ? [] : [{ from: 'RECEIVED', to: o.status, changedAt: new Date() }]
    }));

    console.log(`Inserting ${ordersToInsert.length} realistic orders...`);
    await Order.insertMany(ordersToInsert);
    console.log("🎉 Successfully seeded 4 realistic orders!");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
