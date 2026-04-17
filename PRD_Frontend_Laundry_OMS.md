# 🖥️ PRD — Frontend: Mini Laundry Order Management System

> **Version:** 1.0  
> **Role:** Frontend Engineer  
> **Stack:** React + Vite + Tailwind CSS  
> **Connects to:** Backend API at `/api/v1`  
> **Timeline:** Use remaining hours after backend is working  
> **Principle:** Simple, functional, clean. No fancy animations. Recruiter can see it working.

---

## 1. OVERVIEW

### 1.1 Purpose
A lightweight React UI that connects to the Laundry OMS backend API. Allows store staff to create orders, track them, and view a summary dashboard — all from a browser.

### 1.2 Goal
- Show you can build a functional UI quickly
- Demonstrate clean component thinking
- Show AI leverage in frontend too
- **NOT** to win a design award — keep it simple and working

### 1.3 Non-Goals
- No pixel-perfect design
- No complex animations
- No user authentication UI (unless backend auth bonus done)
- No PWA / mobile-first design
- No Redux / Zustand — local state is enough

---

## 2. TECH STACK

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | React 18 + Vite | Fast dev server, minimal boilerplate |
| Styling | Tailwind CSS | Fast to write, no custom CSS files needed |
| HTTP | Axios | Cleaner than fetch, easy interceptors |
| State | useState + useEffect | Simple app — no need for global state library |
| Routing | React Router v6 | Clean page navigation |
| Notifications | react-hot-toast | 1 line to show success/error messages |
| Icons | lucide-react | Lightweight, consistent icon set |

---

## 3. FOLDER STRUCTURE

```
laundry-oms-frontend/
├── src/
│   ├── api/
│   │   └── client.js          # Axios instance with base URL
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── Orders/
│   │   │   ├── OrderForm.jsx
│   │   │   ├── OrderTable.jsx
│   │   │   ├── OrderFilters.jsx
│   │   │   ├── OrderStatusBadge.jsx
│   │   │   └── StatusUpdateModal.jsx
│   │   ├── Dashboard/
│   │   │   ├── StatCard.jsx
│   │   │   └── RecentOrders.jsx
│   │   └── shared/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       └── Loader.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── CreateOrder.jsx
│   │   ├── OrderList.jsx
│   │   └── OrderDetail.jsx
│   ├── hooks/
│   │   └── useOrders.js       # Reusable data fetching hook
│   ├── utils/
│   │   └── formatters.js      # Currency, date formatters
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 4. PAGES & ROUTING

```
/                → Dashboard (default landing page)
/orders          → Order List (with filters)
/orders/new      → Create New Order
/orders/:id      → Order Detail
```

```jsx
// App.jsx — Route setup
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Dashboard />} />
    <Route path="orders" element={<OrderList />} />
    <Route path="orders/new" element={<CreateOrder />} />
    <Route path="orders/:orderId" element={<OrderDetail />} />
  </Route>
</Routes>
```

---

## 5. PAGE SPECIFICATIONS

---

### 5.1 Dashboard Page (`/`)

**Purpose:** At-a-glance view of the store's daily performance.

**Layout:**
```
┌──────────────────────────────────────────────┐
│  NAVBAR: "🧺 Laundry OMS"    [+ New Order]  │
├──────┬───────────────────────────────────────┤
│      │  Dashboard                             │
│  S   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  I   │  │Total │ │Total │ │Today │ │Ready │ │
│  D   │  │Orders│ │Rev ₹ │ │Orders│ │Pickups││
│  E   │  └──────┘ └──────┘ └──────┘ └──────┘│
│  B   │                                       │
│  A   │  Orders by Status                     │
│  R   │  ●RECEIVED ●PROCESSING ●READY ●DONE  │
│      │  [progress bars or count pills]       │
│      │                                       │
│      │  Recent Orders                        │
│      │  [table: last 5 orders]               │
└──────┴───────────────────────────────────────┘
```

**Components Used:**
- `StatCard` × 4
- `OrderStatusBadge`
- `RecentOrders` table (last 5, links to detail)

**API Call:**
```
GET /api/v1/dashboard
```

**StatCard data mapping:**
| Card | Key | Format |
|------|-----|--------|
| Total Orders | `totalOrders` | Number |
| Total Revenue | `totalRevenue` | `₹ X,XXX` |
| Today's Orders | `todayOrders` | Number |
| Ready for Pickup | `ordersByStatus.READY` | Number |

---

### 5.2 Create Order Page (`/orders/new`)

**Purpose:** Form for store staff to enter new order details.

**Layout:**
```
Create New Order
─────────────────────────────────

Customer Name     [________________]
Phone Number      [________________]

Garments
┌──────────────┬──────────┬────────────┐
│ Garment Type │ Quantity │ Subtotal   │
├──────────────┼──────────┼────────────┤
│ [Dropdown ▼] │   [  1 ] │  ₹ 30     │
│ [Dropdown ▼] │   [  2 ] │  ₹ 160    │
└──────────────┴──────────┴────────────┘
[+ Add Garment]

                      Total Bill: ₹ 190
                      Estimated Delivery: Jul 18, 2024

                      [Cancel]  [Create Order →]
```

**Component: `OrderForm`**

State:
```js
{
  customerName: "",
  phoneNumber: "",
  garments: [
    { type: "", quantity: 1 }
  ]
}
```

Behaviour:
- Garment dropdown options loaded from `GET /api/v1/garments`
- Price auto-fills from garment price config (fetched once, cached in state)
- Subtotal computed live: `quantity × pricePerItem`
- Total bill computed live: `sum of all subtotals`
- `[+ Add Garment]` appends new empty garment row
- Each garment row has `[×]` remove button (min 1 garment always present)
- On submit: `POST /api/v1/orders` → show success toast → redirect to `/orders/:id`

**Validations (frontend):**
- Customer name: required, min 2 chars
- Phone: required, exactly 10 digits (regex: `/^[0-9]{10}$/`)
- Each garment: type must be selected, quantity ≥ 1
- Show inline field errors before submitting

---

### 5.3 Order List Page (`/orders`)

**Purpose:** View, search, and filter all orders.

**Layout:**
```
Orders                                     [+ New Order]
────────────────────────────────────────────────────────

[Search by name or phone...]  [Status ▼]  [Clear]

┌────────────────────────────────────────────────────┐
│ Order ID  │ Customer  │ Phone    │ Total │ Status  │
├────────────────────────────────────────────────────┤
│ ORD-...   │ Ravi K.   │ 987...   │ ₹250  │ READY   │
│ ORD-...   │ Priya S.  │ 981...   │ ₹450  │ PROCESSING│
└────────────────────────────────────────────────────┘

                 ← 1  2  3 →
```

**Component: `OrderTable` + `OrderFilters`**

Features:
- Search input: debounced 400ms → hits `?customerName=X` or `?phone=X`
- Status filter dropdown: `All | RECEIVED | PROCESSING | READY | DELIVERED`
- Clicking a row → navigates to `/orders/:orderId`
- Pagination: prev/next buttons, show page X of Y
- `OrderStatusBadge` — color-coded pills:
  ```
  RECEIVED    → grey
  PROCESSING  → yellow
  READY       → blue
  DELIVERED   → green
  ```

**API Call:**
```
GET /api/v1/orders?customerName=X&status=Y&page=1&limit=10
```

---

### 5.4 Order Detail Page (`/orders/:orderId`)

**Purpose:** Full order view + ability to update status.

**Layout:**
```
← Back to Orders

Order: ORD-20240716-0001                  [Update Status ▼]
────────────────────────────────────────────────────────────

Customer        Ravi Kumar
Phone           9876543210
Status          🟡 PROCESSING
Created         Jul 16, 2024 — 10:00 AM
Est. Delivery   Jul 18, 2024

Garments
──────────────────────────────────
SHIRT      × 3     ₹30/piece    ₹ 90
SAREE      × 2     ₹80/piece    ₹ 160
──────────────────────────────────
                  TOTAL:  ₹ 250

Status History
──────────────────────────────────
● RECEIVED    →  PROCESSING     Jul 16 — 11:00 AM
```

**Update Status Flow:**
- `[Update Status ▼]` button opens a small modal or dropdown
- Shows only valid next statuses (forward transitions only)
- Confirms and calls `PATCH /api/v1/orders/:id/status`
- On success: refreshes page data + shows toast

---

## 6. SHARED COMPONENTS

### 6.1 `StatCard`
```jsx
<StatCard
  title="Total Revenue"
  value="₹ 32,400"
  icon={<IndianRupee size={20} />}
  color="green"   // drives border/icon color
/>
```

### 6.2 `OrderStatusBadge`
```jsx
<OrderStatusBadge status="PROCESSING" />
// Renders: 🟡 PROCESSING (pill with matching bg color)
```

### 6.3 `Button`
```jsx
<Button variant="primary" onClick={...} loading={isSubmitting}>
  Create Order
</Button>
// Supports: primary | secondary | danger | ghost
// loading prop → shows spinner, disables click
```

### 6.4 `Loader`
```jsx
<Loader /> // Centered spinner — used during API calls
```

---

## 7. API CLIENT SETUP

```js
// src/api/client.js
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
});

// Response interceptor — normalize errors
client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default client;
```

```js
// Usage in any component
import client from "../api/client";

const data = await client.post("/orders", payload);
const orders = await client.get("/orders", { params: { status: "READY" } });
```

---

## 8. CUSTOM HOOK — `useOrders`

```js
// src/hooks/useOrders.js
// Handles: loading, error, data, refetch

const { orders, loading, error, refetch } = useOrders({ status, page, limit });
```

Benefits:
- Removes boilerplate from every page
- One place to change API call logic
- Easy to test/extend

---

## 9. ENVIRONMENT CONFIG

```env
# .env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 10. DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "axios": "^1.x",
    "react-hot-toast": "^2.x",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

---

## 11. AI USAGE LOG (Document This for Submission)

| Prompt | Tool | Got Right | Fixed |
|--------|------|-----------|-------|
| "Generate a React order form with dynamic garment rows, auto-calculate total bill" | ChatGPT | Row add/remove logic, total calc | Fixed to load prices from API instead of hardcoding |
| "Create a Tailwind CSS status badge component with color variants for order statuses" | Copilot | Color class logic | Added proper color for all 4 statuses |
| "Write an axios client with base URL from env and error interceptor" | ChatGPT | Interceptor pattern correct | Added timeout, normalized error message |
| "Generate a React dashboard page with 4 stat cards using Tailwind" | ChatGPT | Layout good | Removed hardcoded mock data, wired real API |
| "Write a custom useOrders hook with loading, error, data states" | Copilot | Hook structure correct | Added refetch function, fixed dependency array |

---

## 12. SETUP INSTRUCTIONS

```bash
# Clone and install
git clone <your-repo>
cd laundry-oms-frontend
npm install

# Configure
cp .env.example .env
# Set VITE_API_URL to your backend URL

# Run
npm run dev       # starts at http://localhost:5173

# Build for production
npm run build
```

> Make sure backend is running before starting frontend.

---

## 13. TRADEOFFS

| Decision | Reason |
|----------|--------|
| React + Vite over Next.js | Simpler, no SSR needed, faster to start |
| Tailwind over CSS modules | 10× faster to write UI without leaving JSX |
| Local state over Redux | Only 4 pages, no cross-page state sharing needed |
| No pagination library | Manual pagination is 20 lines and shows you understand it |
| No chart library for dashboard | Status pills + numbers are faster to build, just as readable |

---

## 14. WHAT I'D DO WITH MORE TIME

- Add React Query for server state management (caching, refetch on focus)
- Add a proper receipt/invoice printable view per order
- Add date range filter on order list
- Add dark mode toggle
- Deploy on Vercel with env pointing to Render-deployed backend

---

## 15. BONUS: DEPLOYMENT PLAN

| Service | What |
|---------|------|
| **Render** | Deploy Express backend (free tier, auto-deploy from GitHub) |
| **MongoDB Atlas** | Free tier cloud MongoDB |
| **Vercel** | Deploy React frontend (auto from GitHub, set VITE_API_URL env) |

Steps:
1. Push backend to GitHub → connect to Render → set `MONGODB_URI` env var
2. Create Atlas cluster → get connection string → paste to Render env
3. Push frontend to GitHub → connect to Vercel → set `VITE_API_URL` to Render URL
4. Done. Live link for recruiter in README.

---

*Frontend PRD complete. Build backend API first → verify with Postman → then build this UI on top.*
