# 🧺 Laundry OMS — Backend API

A production-grade REST API for a dry cleaning store to manage orders end-to-end — from creation to delivery.

Built with **Node.js + Express + MongoDB** (with in-memory fallback).

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI (optional — falls back to in-memory)

# Run in development (with auto-reload)
npm run dev

# Run in production
npm start
```

API runs at: `http://localhost:5000/api/v1`

---

## 📁 Project Structure

```
src/
├── config/
│   └── db.js              # MongoDB connection (with in-memory fallback)
├── constants/
│   └── garments.js        # Garment prices, valid types, status transitions
├── controllers/
│   ├── order.controller.js
│   └── dashboard.controller.js
├── middleware/
│   ├── errorHandler.js    # Global error handler + AppError class
│   └── validate.js        # express-validator rules
├── models/
│   └── Order.model.js     # Mongoose schema
├── routes/
│   ├── order.routes.js
│   └── dashboard.routes.js
├── services/
│   └── order.service.js   # All business logic + DB abstraction
└── app.js                 # Express app entry point
```

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/orders` | Create a new order |
| `GET` | `/api/v1/orders` | List orders (with filters + pagination) |
| `GET` | `/api/v1/orders/:orderId` | Get order detail |
| `PATCH` | `/api/v1/orders/:orderId/status` | Update order status |
| `GET` | `/api/v1/garments` | Get garment price list |
| `GET` | `/api/v1/dashboard` | Dashboard summary stats |

### Query Parameters for `GET /orders`

| Param | Type | Description |
|-------|------|-------------|
| `status` | String | Filter by status (RECEIVED, PROCESSING, READY, DELIVERED) |
| `customerName` | String | Partial match, case-insensitive |
| `phone` | String | Exact match |
| `garmentType` | String | Filter orders containing this garment type |
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Items per page (default: 10) |

---

## 💰 Garment Prices (INR)

| Garment | Price |
|---------|-------|
| SHIRT | ₹30 |
| PANTS | ₹40 |
| SAREE | ₹80 |
| SUIT | ₹150 |
| JACKET | ₹120 |
| KURTA | ₹50 |
| DRESS | ₹70 |
| BED_SHEET | ₹60 |

---

## 🔄 Status Transitions (Forward-Only)

```
RECEIVED → PROCESSING → READY → DELIVERED
```

Backward transitions are rejected with `400 Bad Request`.

---

## 📦 Sample Requests

### Create Order
```bash
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Ravi Kumar",
    "phoneNumber": "9876543210",
    "garments": [
      { "type": "SHIRT", "quantity": 3 },
      { "type": "SAREE", "quantity": 2 }
    ]
  }'
```

### Update Status
```bash
curl -X PATCH http://localhost:5000/api/v1/orders/ORD-20240716-0001/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "PROCESSING" }'
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `MONGODB_URI` | mongodb://localhost:27017/laundry-oms | MongoDB connection string |
| `DELIVERY_DAYS` | 2 | Days added to createdAt for estimated delivery |
| `PRICE_MARKUP` | 0 | Optional percentage markup on garment prices |

---

## 🛡️ Error Handling

All errors return a consistent JSON shape:

```json
{
  "success": false,
  "message": "Human-readable error",
  "error": "Technical detail (only in dev mode)"
}
```

| HTTP Code | Scenario |
|-----------|----------|
| `201` | Order created |
| `200` | Fetch/update successful |
| `400` | Validation failure / invalid status transition |
| `404` | Order not found |
| `409` | Duplicate order (same phone + garments within 5 min) |
| `500` | Internal server error |
