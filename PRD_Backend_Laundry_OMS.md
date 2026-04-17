# 📦 PRD — Backend: Mini Laundry Order Management System

> **Version:** 1.0  
> **Role:** Backend Engineer  
> **Stack:** Node.js + Express + MongoDB (with in-memory fallback)  
> **Timeline:** 72 hours  
> **AI-First Build:** Yes — Claude / ChatGPT / Copilot as primary coding partner

---

## 1. OVERVIEW

### 1.1 Purpose
Build a production-grade REST API backend for a dry cleaning store to manage orders end-to-end — from creation to delivery. The system must be clean, fast to build, and demonstrate strong engineering judgment over raw complexity.

### 1.2 Goal
Deliver a working API within 72 hours that handles real-world edge cases, is well-structured, and showcases AI-assisted development without over-engineering.

### 1.3 Non-Goals
- No microservices
- No message queues
- No GraphQL
- No admin portal (that's frontend)
- No complex role-based access (basic auth only if time permits)

---

## 2. SYSTEM ARCHITECTURE

```
Client (Postman / UI)
        │
        ▼
┌────────────────────────┐
│     Express Router      │  ← Route definitions
├────────────────────────┤
│   Middleware Layer      │  ← Error handler, validator, logger
├────────────────────────┤
│   Controller Layer      │  ← Business logic
├────────────────────────┤
│   Service Layer         │  ← DB abstraction / transformations
├────────────────────────┤
│   MongoDB / In-Memory   │  ← Data persistence
└────────────────────────┘
```

**Folder Structure:**
```
laundry-oms-backend/
├── src/
│   ├── config/
│   │   └── db.js              # DB connection
│   ├── constants/
│   │   └── garments.js        # Hardcoded price list
│   ├── controllers/
│   │   ├── order.controller.js
│   │   └── dashboard.controller.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   └── Order.model.js
│   ├── routes/
│   │   ├── order.routes.js
│   │   └── dashboard.routes.js
│   ├── services/
│   │   └── order.service.js
│   └── app.js
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## 3. DATA MODEL

### 3.1 Order Schema

```js
Order {
  orderId       : String,     // Auto-generated: "ORD-YYYYMMDD-XXXX"
  customerName  : String,     // Required
  phoneNumber   : String,     // Required, 10-digit validation
  garments      : [
    {
      type      : String,     // "Shirt" | "Pants" | "Saree" etc.
      quantity  : Number,     // Min: 1
      pricePerItem: Number,   // From price config
      subtotal  : Number      // quantity × pricePerItem (computed)
    }
  ],
  totalBill     : Number,     // Computed: sum of all subtotals
  status        : Enum,       // RECEIVED | PROCESSING | READY | DELIVERED
  estimatedDelivery: Date,    // createdAt + 2 days (configurable)
  createdAt     : Date,
  updatedAt     : Date,
  statusHistory : [
    {
      from      : String,
      to        : String,
      changedAt : Date
    }
  ]
}
```

### 3.2 Garment Price Config (Hardcoded, Easily Changeable)

```js
// src/constants/garments.js
const GARMENT_PRICES = {
  SHIRT       : 30,
  PANTS       : 40,
  SAREE       : 80,
  SUIT        : 150,
  JACKET      : 120,
  KURTA       : 50,
  DRESS       : 70,
  BED_SHEET   : 60,
};
```

> **Note for AI prompt log:** "Generate a price config object for dry cleaning in Indian Rupees for common garments. Include shirt, pants, saree, suit, jacket, kurta. Keep it extensible."

---

## 4. API CONTRACT

### Base URL: `/api/v1`

---

### 4.1 Create Order
```
POST /api/v1/orders
```

**Request Body:**
```json
{
  "customerName": "Ravi Kumar",
  "phoneNumber": "9876543210",
  "garments": [
    { "type": "SHIRT", "quantity": 3 },
    { "type": "SAREE", "quantity": 2 }
  ]
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-20240716-0001",
    "customerName": "Ravi Kumar",
    "phoneNumber": "9876543210",
    "garments": [
      { "type": "SHIRT", "quantity": 3, "pricePerItem": 30, "subtotal": 90 },
      { "type": "SAREE", "quantity": 2, "pricePerItem": 80, "subtotal": 160 }
    ],
    "totalBill": 250,
    "status": "RECEIVED",
    "estimatedDelivery": "2024-07-18T00:00:00.000Z",
    "createdAt": "2024-07-16T10:00:00.000Z"
  }
}
```

**Validations:**
- `customerName` → required, min 2 chars
- `phoneNumber` → required, exactly 10 digits
- `garments` → required, min 1 item
- `garments[].type` → must be a valid garment key from price config
- `garments[].quantity` → required, integer ≥ 1

---

### 4.2 Update Order Status
```
PATCH /api/v1/orders/:orderId/status
```

**Request Body:**
```json
{
  "status": "PROCESSING"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-20240716-0001",
    "status": "PROCESSING",
    "statusHistory": [
      { "from": "RECEIVED", "to": "PROCESSING", "changedAt": "2024-07-16T11:00:00.000Z" }
    ],
    "updatedAt": "2024-07-16T11:00:00.000Z"
  }
}
```

**Validations:**
- Status must be one of `RECEIVED | PROCESSING | READY | DELIVERED`
- Status transitions must be forward only:
  `RECEIVED → PROCESSING → READY → DELIVERED`
  (reject invalid backward transitions with 400 + clear message)

---

### 4.3 Get All Orders (with filters)
```
GET /api/v1/orders
```

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | String | Filter by order status |
| `customerName` | String | Partial match (case-insensitive) |
| `phone` | String | Exact match |
| `page` | Number | Default: 1 |
| `limit` | Number | Default: 10 |

**Response `200`:**
```json
{
  "success": true,
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "data": [ /* array of order objects */ ]
}
```

---

### 4.4 Get Order by ID
```
GET /api/v1/orders/:orderId
```

**Response `200`:** Full order object with `statusHistory`.

**Response `404`:**
```json
{
  "success": false,
  "message": "Order ORD-20240716-0001 not found"
}
```

---

### 4.5 Get Garment Price List
```
GET /api/v1/garments
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "SHIRT": 30,
    "PANTS": 40,
    "SAREE": 80
    // ...
  }
}
```
> Useful for the frontend to dynamically render dropdowns.

---

### 4.6 Dashboard Summary
```
GET /api/v1/dashboard
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 145,
    "totalRevenue": 32400,
    "ordersByStatus": {
      "RECEIVED": 12,
      "PROCESSING": 28,
      "READY": 35,
      "DELIVERED": 70
    },
    "recentOrders": [ /* last 5 orders */ ],
    "todayOrders": 8,
    "todayRevenue": 1200
  }
}
```

---

## 5. MIDDLEWARE DESIGN

### 5.1 Global Error Handler
```js
// All controllers throw errors, this catches them
// Returns consistent error shape:
{
  "success": false,
  "message": "Human-readable error",
  "error": "Technical detail (only in dev mode)"
}
```

### 5.2 Request Validator
- Use `express-validator` or `joi` for schema validation
- Validate before entering controller — controllers assume clean data
- Return `400` with field-level error messages on failure

### 5.3 Request Logger
- Log: method, path, status, response time
- Use `morgan` for HTTP logging

---

## 6. ORDER ID GENERATION LOGIC

```
Format: ORD-YYYYMMDD-XXXX
Example: ORD-20240716-0043

Logic:
1. Get today's date → "20240716"
2. Count orders created today → increment by 1
3. Pad to 4 digits → "0043"
4. Concatenate → "ORD-20240716-0043"
```

> Collision-safe for up to 9999 orders/day. More than enough for a dry cleaning store.

---

## 7. ENVIRONMENT CONFIGURATION

```env
# .env.example
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/laundry-oms
DELIVERY_DAYS=2           # Days added to createdAt for estimated delivery
PRICE_MARKUP=0            # Optional % markup on hardcoded prices
```

---

## 8. DEPENDENCIES

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.x",
    "dotenv": "^16.x",
    "morgan": "^1.10.0",
    "cors": "^2.8.5",
    "express-validator": "^7.x"
  },
  "devDependencies": {
    "nodemon": "^3.x"
  }
}
```

> **Why no TypeScript?** Speed. 72-hour constraint. JS + JSDoc comments give enough clarity without build overhead.

> **Why MongoDB?** Schema-flexible for garments array. Easy local setup. Mongoose gives clean model layer.

---

## 9. ERROR CODES REFERENCE

| HTTP | Scenario |
|------|----------|
| `201` | Order created successfully |
| `200` | Fetch/update successful |
| `400` | Validation failure / invalid status transition |
| `404` | Order not found |
| `409` | Duplicate order (same phone + same garments within 5 min) |
| `500` | Internal server error |

---

## 10. BONUS FEATURES (Implement if time allows)

### Bonus A — Search by Garment Type
```
GET /api/v1/orders?garmentType=SAREE
```
Filters orders that contain at least one SAREE garment.

### Bonus B — Basic Auth Middleware
```
Header: Authorization: Basic base64(username:password)
```
Protect write endpoints (POST, PATCH). Read endpoints remain open.
Store credentials in `.env`.

### Bonus C — Estimated Delivery Date
- Auto-set to `createdAt + DELIVERY_DAYS` (from config)
- Surface in GET /orders response
- Already included in data model above — just wire the env config

---

## 11. AI USAGE LOG (Must Document This)

| Prompt | Tool Used | What It Got Right | What You Fixed |
|--------|-----------|-------------------|----------------|
| "Generate Express boilerplate with error handler, cors, morgan, dotenv" | ChatGPT | Full app.js scaffold | Removed unnecessary helmet setup, added /api/v1 prefix |
| "Write Mongoose schema for a laundry order with garments array and status enum" | Copilot | Schema structure correct | Added statusHistory tracking, added computed totalBill |
| "Write a controller function to create an order, auto-calculate bill from price config" | ChatGPT | Logic correct | Fixed orderId generation, added estimatedDelivery logic |
| "Write validation middleware using express-validator for phone and garments array" | ChatGPT | Got phone regex right | Added garment type whitelist check |
| "Generate dashboard aggregation query in Mongoose" | ChatGPT | Correct aggregate pipeline | Fixed groupBy status to use $group correctly |

---

## 12. TRADEOFFS & DECISIONS

| Decision | Rationale |
|----------|-----------|
| In-memory fallback + MongoDB | Works without DB setup, easily swappable |
| Hardcoded prices in constants file | Assignment says "hardcode or configure" — this is cleaner than DB-stored prices for MVP |
| No auth by default | Out of scope for core; added as bonus |
| Forward-only status transitions | Real business logic — you can't "un-deliver" an order |
| Pagination on list API | Shows production thinking, minimal extra effort |
| `statusHistory` tracking | Low cost, high value — shows how order moved through stages |

---

## 13. WHAT I'D DO WITH MORE TIME

- Add unit tests with Jest + Supertest
- Add Redis caching for dashboard endpoint
- Add webhook/notification when order status changes
- Move price config to DB with admin API to update
- Add soft delete (cancel order) flow
- Rate limiting on POST /orders

---

## 14. SETUP INSTRUCTIONS (for README)

```bash
# Clone and install
git clone <your-repo>
cd laundry-oms-backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI

# Run locally
npm run dev       # nodemon
npm start         # production

# API runs at
http://localhost:5000/api/v1
```

---

## 15. POSTMAN COLLECTION STRUCTURE

```
📁 Laundry OMS API
  📁 Orders
    POST   /orders              → Create Order
    GET    /orders              → List Orders
    GET    /orders?status=READY → Filter by Status
    GET    /orders/:orderId     → Get Order Detail
    PATCH  /orders/:id/status   → Update Status
  📁 Garments
    GET    /garments            → Price List
  📁 Dashboard
    GET    /dashboard           → Summary Stats
```

---

*PRD ends here. Build the backend first, get it working, then move to frontend PRD.*
