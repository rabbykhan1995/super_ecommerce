# Ecommerce Checkout & Stripe Payment Feature

## Table of Contents

1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Problem: Discount Price Bug](#problem-discount-price-bug)
4. [Architecture Design](#architecture-design)
5. [Backend: Ecom Order Tables](#backend-ecom-order-tables)
6. [Backend: Stripe Integration](#backend-stripe-integration)
7. [Backend: Cart Discount Fix](#backend-cart-discount-fix)
8. [Frontend: Checkout Page](#frontend-checkout-page)
9. [Frontend: Order Confirmation Page](#frontend-order-confirmation-page)
10. [Frontend: Public Order Tracking Page](#frontend-public-order-tracking-page)
11. [Frontend: My Orders Page](#frontend-my-orders-page)
12. [Flow Diagrams](#flow-diagrams)
13. [File Structure](#file-structure)
14. [Environment Variables](#environment-variables)
15. [Implementation Order](#implementation-order)

---

## Overview

This feature adds a complete checkout flow to the ecommerce frontend:

- **Checkout page** with shipping info form + order summary
- **Stripe payment integration** (Stripe Checkout Sessions for card payments)
- **Ecom order + items** created at checkout (independent of sale)
- **Sale creation** happens after payment confirmation (Stripe webhook or COD delivery)
- **Fix discount price** in the cart -- store both prices, validate at checkout
- **Order confirmation** page after successful payment
- **Public order tracking** page -- anyone can view order details by order number, no auth needed
- **My Orders** page for logged-in customers

---

## Current State Analysis

### What Exists

| Feature | Status | Notes |
|---------|--------|-------|
| Cart (add/remove/update/clear) | Working | Backend + Frontend |
| Cart page (`/cart`) | Working | Full-page cart with order summary |
| Cart slider | Working | Slide-out quick cart |
| Product listing / detail | Working | With discount display on cards + modals |
| Backend `sale` module | Working | POS/invoicing with `sale` + `sale_items` tables |
| Backend `ecom` module | Working | Banners, flash sales, featured products |
| Backend `cart` module | Working | Stores `variant.salePrice` only |
| Auth (JWT) | Working | Token in cookies, middleware protection |
| Config folder | Working | `redis.config.ts`, `imagekit.config.ts`, `mailSender.config.ts` |

### What's Missing

| Feature | Status |
|---------|--------|
| Checkout page | **MISSING** -- "Proceed to Checkout" links to `/cart` |
| Ecom order backend | **MISSING** -- no customer-facing order API |
| Stripe integration | **MISSING** -- no `stripe` package, no payment flow |
| Order confirmation page | **MISSING** |
| Public order tracking | **MISSING** |
| My Orders page | Route defined (`/user/my-orders`) but no page |
| Discount price in cart | **BUGGY** -- cart stores only `salePrice`, ignores `discountPrice` |

---

## Problem: Discount Price Bug

### Root Cause

**Backend `cart.service.ts` line 45:**
```typescript
price: variant.salePrice as number,  // Always uses salePrice, ignores discountPrice
```

When a variant has a `discountPrice` that is lower than `salePrice`, the cart still stores only `salePrice`. The customer sees the discount on the product card/modal but the cart shows the full `salePrice`.

### Fix

**Store BOTH prices in the cart.** The cart should hold `salePrice` (original) and `discountPrice` (if exists). At checkout time, the backend **validates** whether the `discountPrice` is still valid and uses the correct price.

---

## Architecture Design

### Why Integrate Into Existing `ecom` Module?

The existing `sale` module is a POS/invoicing system. The ecommerce checkout needs customer-facing orders. **Decision: Add order functionality to the existing `ecom` module** -- keeps all ecommerce logic together.

### Key Concept: Order Items vs Sale Items

```
ecom_order + ecom_order_items          sale + sale_items
(Created at checkout)                  (Created after payment confirmation)
+---------------------------------+    +---------------------------------+
| Order info                      |    | Financial/inventory record      |
| Shipping, Stripe, tracking      |    | Batch allocation (FIFO)         |
| Customer's view of their order  |    | Accounting, ledger              |
+---------------------------------+    +---------------------------------+
        |                                        |
        |  ecom_order_items = what was ordered   |
        |  sale_items = what was invoiced/sold   |
        +-- Linked via ecom_order.saleID --------+
```

- **`ecom_order_items`**: Created at checkout. Snapshot of what the customer ordered. Always present. This is the primary source for order display.
- **`sale_items`**: Created when payment is confirmed. Financial/inventory record with batch allocation. Used for accounting.
- **`ecom_order`**: Links to `sale` via `saleID` (set after sale creation).

### Why Separate Order Items?

1. **COD orders**: Sale is created later (on delivery/payment). Order items must exist before sale.
2. **Order history**: If sale is ever deleted, order items are preserved for customer history.
3. **Cancellation**: Cancelled orders keep their items. No sale created.
4. **Independence**: Order items are customer-facing, sale items are accounting-facing.

### Discount Price Validation at Checkout

When the user clicks "Place Order":

1. Backend fetches the cart items
2. For each item, re-fetches the current variant from DB
3. Checks if `variant.discountPrice` is still valid:
   - Exists and > 0
   - Less than `variant.salePrice`
   - (Optional) Check flash sale expiry if applicable
4. If valid -> use `discountPrice` as the order item price
5. If invalid/expired -> use `salePrice` as the order item price
6. Creates `ecom_order` + `ecom_order_items` with validated prices

---

## Backend: Ecom Order Tables

### New/Modified Files in Ecom Module

```
backend/src/ecom/
  ecom.table.ts              # MODIFY -- add ecomOrderTable, ecomOrderItemTable
  ecom.type.ts               # MODIFY -- add order types
  ecom.validator.ts          # MODIFY -- add order validation schemas
  ecom.repository.ts         # MODIFY -- add order CRUD methods
  ecom.service.ts            # MODIFY -- add checkout, order management, webhook logic
  ecom.controller.ts         # MODIFY -- add order handlers
  ecom.route.ts              # MODIFY -- add order routes
```

### Database Schema

#### `ecom_orders` Table (add to `ecom.table.ts`)

```typescript
export const ecomOrderTable = pgTable("ecom_orders", {
  id: serial("id").primaryKey(),
  userID: uuid("user_id").notNull().references(() => userTable.id),
  saleID: integer("sale_id").references(() => saleTable.id), // nullable -- set after payment
  orderNo: varchar("order_no", { length: 50 }).notNull().unique(),

  // Status
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  // pending -> hold -> confirmed -> processing -> shipped -> delivered
  // pending -> cancelled
  // pending -> failed

  // Pricing
  subtotal: numeric("subtotal", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),
  shippingCost: numeric("shipping_cost", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),
  discount: numeric("discount", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),
  totalAmount: numeric("total_amount", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),

  // Payment
  paymentMethod: varchar("payment_method", { length: 30 }),  // 'stripe', 'cod'
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("unpaid"),
  // unpaid -> paid -> refunded
  stripeSessionID: varchar("stripe_session_id", { length: 255 }),
  stripePaymentIntent: varchar("stripe_payment_intent", { length: 255 }),
  paidAt: timestamp("paid_at", { withTimezone: true }),

  // Shipping
  shippingName: varchar("shipping_name", { length: 255 }).notNull(),
  shippingPhone: varchar("shipping_phone", { length: 20 }).notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: varchar("shipping_city", { length: 100 }),
  shippingArea: varchar("shipping_area", { length: 100 }),

  // Notes
  note: text("note"),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

**Note:** `saleID` is **nullable** because for COD orders, the sale is created later (on delivery/payment).

#### `ecom_order_items` Table (add to `ecom.table.ts`)

```typescript
export const ecomOrderItemTable = pgTable("ecom_order_items", {
  id: serial("id").primaryKey(),
  orderID: integer("order_id").notNull().references(() => ecomOrderTable.id, { onDelete: "cascade" }),
  productID: integer("product_id").notNull().references(() => productTable.id),
  variantID: integer("variant_id").notNull().references(() => variantTable.id),

  // Snapshot at time of order
  productName: varchar("product_name", { length: 255 }).notNull(),
  variantAttrs: jsonb("variant_attrs").$type<{ name: string; value: string }[]>(),
  thumbnail: text("thumbnail"),

  // Pricing snapshot (validated at checkout)
  salePrice: numeric("sale_price", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),
  discountPrice: numeric("discount_price", { mode: "number", precision: 12, scale: 2 }),
  quantity: numeric("quantity", { mode: "number", precision: 10, scale: 2 }).notNull().default(1),
  lineTotal: numeric("line_total", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

#### Relations

```typescript
export const ecomOrderRelations = relations(ecomOrderTable, ({ one, many }) => ({
  user: one(userTable, { fields: [ecomOrderTable.userID], references: [userTable.id] }),
  sale: one(saleTable, { fields: [ecomOrderTable.saleID], references: [saleTable.id] }),
  items: many(ecomOrderItemTable),
}));

export const ecomOrderItemRelations = relations(ecomOrderItemTable, ({ one }) => ({
  order: one(ecomOrderTable, { fields: [ecomOrderItemTable.orderID], references: [ecomOrderTable.id] }),
  product: one(productTable, { fields: [ecomOrderItemTable.productID], references: [productTable.id] }),
  variant: one(variantTable, { fields: [ecomOrderItemTable.variantID], references: [variantTable.id] }),
}));
```

### Order Status Flow

```
pending -----> hold -----> confirmed -----> processing -----> shipped -----> delivered
   |              |              |
   +--> cancelled +--> cancelled +--> cancelled
   +--> failed
```

- **pending**: Order created, awaiting payment (Stripe session opened). User can cancel.
- **hold**: Order under review by admin (address verification, fraud check). User cannot cancel.
- **confirmed**: Payment received successfully (Stripe) or admin confirmed (COD). Sale created.
- **processing**: Admin is preparing the order.
- **shipped**: Order shipped with tracking.
- **delivered**: Customer received the order. For COD: sale created at this point.
- **cancelled**: Order cancelled. Only allowed for pending orders. No sale created.
- **failed**: Stripe payment failed or session expired.

### Order Number Generation

Format: `ORD-YYYYMMDD-XXXXXX`

- `YYYYMMDD` = current date
- `XXXXXX` = auto-incrementing sequence per day

Example: `ORD-20260722-000001`

### Zod Validation Schemas (add to `ecom.validator.ts`)

```typescript
export const createEcomOrderSchema = z.object({
  shipping: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().optional(),
    area: z.string().optional(),
  }),
  note: z.string().optional(),
  paymentMethod: z.enum(["stripe", "cod"]),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["hold", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
});
```

### Routes (add to `ecom.route.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ecom/checkout` | `authMiddleware` | Create order + items from cart |
| GET | `/ecom/my-orders` | `authMiddleware` | List customer's orders |
| GET | `/ecom/my-orders/:orderNo` | `authMiddleware` | Get single order detail (authenticated) |
| POST | `/ecom/cancel/:orderNo` | `authMiddleware` | Cancel pending order (user) |
| GET | `/ecom/order/:orderNo` | **No auth** | **Public** order tracking |
| POST | `/ecom/stripe/webhook` | **No auth** (Stripe signature) | Stripe webhook handler |
| GET | `/ecom/order-success` | `authMiddleware` | Redirect target after Stripe success |
| PATCH | `/ecom/admin/order/:orderNo/status` | `authMiddleware` + `adminMiddleware` | Admin update order status |
| POST | `/ecom/admin/order/:orderNo/confirm-sale` | `authMiddleware` + `adminMiddleware` | Admin create sale for COD order |

### Service: Checkout Flow (add to `ecom.service.ts`)

```
EcomService.createOrder(userID, shippingInfo, paymentMethod)
|
+-- 1. Fetch user's cart items (with variant + product data)
|      - Validate cart is not empty
|      - Validate all items are in stock
|
+-- 2. For each cart item -- VALIDATE DISCOUNT PRICE
|      - Re-fetch variant from DB (current state)
|      - Check: variant.discountPrice exists? > 0? < variant.salePrice?
|      - If valid -> effectivePrice = variant.discountPrice
|      - If invalid -> effectivePrice = variant.salePrice
|
+-- 3. Compute totals (using validated prices)
|      - subtotal = sum of (effectivePrice * quantity)
|      - discount = sum of ((salePrice - effectivePrice) * quantity) for discounted items
|      - totalAmount = subtotal (shipping free for now)
|
+-- 4. Create ecom_order + ecom_order_items (in transaction)
|      - Generate orderNo
|      - Insert ecomOrderTable (status: "pending", payment_status: "unpaid", saleID: null)
|      - Insert ecomOrderItemsTable for each item (snapshot with validated prices)
|      - Decrease stock (variant, product)
|      - Clear user's cart
|
+-- 5. If paymentMethod === "stripe"
|      - Create Stripe Checkout Session with line items
|      - Store stripeSessionID on the ecom_order
|      - Return { orderNo, stripeSessionUrl }
|
+-- 6. If paymentMethod === "cod"
|      - Set ecom_order status: "confirmed"
|      - Return { orderNo, message: "Order placed" }
|      - NOTE: No sale created yet. Sale will be created on delivery/payment confirmation.
|
+-- 7. Return response
```

### Service: Stripe Webhook Handler (add to `ecom.service.ts`)

```
EcomService.handleStripeWebhook(event)
|
+-- event.type === "checkout.session.completed"
|      - Find ecom_order by stripeSessionID
|      - Create sale + sale_items from ecom_order_items
|      - Link ecom_order.saleID to the new sale
|      - Update ecom_order: status -> "confirmed", payment_status -> "paid", paid_at -> now
|      - Update sale: paid = totalAmount
|
+-- event.type === "checkout.session.expired"
|      - Find ecom_order by stripeSessionID
|      - Update ecom_order: status -> "failed"
|      - Restore stock (variant, product)
|
+-- event.type === "charge.refunded"
       - Find ecom_order by stripePaymentIntent
       - Update ecom_order: payment_status -> "refund_requested"
```

### Service: COD Sale Creation (add to `ecom.service.ts`)

```
EcomService.createSaleForCodOrder(orderNo, adminID)
|
+-- Find ecom_order by orderNo
+-- Validate: status must be "confirmed" or "delivered"
+-- Validate: saleID is null (sale not yet created)
+-- Create sale + sale_items from ecom_order_items
+-- Link ecom_order.saleID to the new sale
+-- Update sale: paid = totalAmount (if delivered with payment)
```

### Service: Cancel Order (add to `ecom.service.ts`)

```
EcomService.cancelOrder(orderNo, userID)
|
+-- Find ecom_order by orderNo + userID
+-- Validate: status must be "pending" (only pending orders can be cancelled)
+-- Update ecom_order: status -> "cancelled"
+-- Restore stock (variant, product)
+-- NOTE: No sale was created, so nothing to delete
```

### Service: Delete Order (add to `ecom.service.ts`)

```
EcomService.deleteOrder(orderNo)
|
+-- Find ecom_order by orderNo
+-- If saleID exists:
|      - Delete sale by saleID (SaleRepository.delete)
|      - This cascades to sale_items (existing FK)
|      - This cascades to ecom_order (FK: ecom_order.saleID -> sale.id ON DELETE CASCADE)
+-- If saleID is null:
|      - Delete ecom_order_items by orderID
|      - Delete ecom_order by orderNo
+-- NOTE: This is for admin cleanup only. Users cancel, not delete.
```

### Service: Public Order Tracking (add to `ecom.service.ts`)

```
EcomService.getPublicOrder(orderNo)
|
+-- Find ecom_order by orderNo (no user check -- public)
+-- Fetch ecom_order_items with product snapshot data
+-- Return order details (status, items, totals, shipping, timestamps)
+-- Does NOT expose: stripeSessionID, stripePaymentIntent, saleID, batchID
```

---

## Backend: Stripe Integration

### Install Package

```bash
cd backend && bun add stripe
```

### Config File: `backend/config/stripe.config.ts`

Following the existing config pattern (`redis.config.ts`, `imagekit.config.ts`, `mailSender.config.ts`):

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export default stripe;
```

### Stripe Checkout Session Creation

```typescript
// In ecom.service.ts
import stripe from "../../config/stripe.config";

static async createStripeSession(orderNo: string, items: EcomOrderItem[], totalAmount: number) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: items.map((item) => ({
      price_data: {
        currency: "usd",  // or "bdt" for Bangladeshi Taka
        product_data: {
          name: item.productName,
          images: item.thumbnail ? [item.thumbnail] : [],
        },
        unit_amount: Math.round((item.discountPrice ?? item.salePrice) * 100),
      },
      quantity: item.quantity,
    })),
    success_url: `${process.env.ECOM_CLIENT_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.ECOM_CLIENT_URL}/cart`,
    metadata: {
      orderNo: orderNo,
    },
  });

  return session;
}
```

### Stripe Webhook Setup

**Route:** `POST /api/ecom/stripe/webhook`

This endpoint must NOT use auth middleware. Instead, it verifies the Stripe signature:

```typescript
// ecom.controller.ts

static async stripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,                           // raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await EcomService.handleStripeWebhook(event);
  res.status(200).json({ received: true });
}
```

**Important:** The webhook route needs raw body parsing, not JSON. In `app.ts`:

```typescript
// Before JSON middleware for this specific route
app.use("/api/ecom/stripe/webhook", express.raw({ type: "application/json" }));

// After JSON middleware for all other routes
app.use(express.json());
```

---

## Backend: Cart Discount Fix

### Changes to `cart.table.ts`

Add `discountPrice` column. Keep `salePrice` as the original price:

```typescript
// In cartTable definition -- add new column
discountPrice: numeric("discount_price", { mode: "number", precision: 12, scale: 2 }),
```

### Changes to `cart.service.ts` -- `addToCart`

```typescript
// Lines 40-51 -- REPLACE the addItem call:

return CartRepository.addItem({
  userID,
  productID,
  variantID,
  name: product.name,
  price: variant.salePrice as number,            // always the original salePrice
  discountPrice: variant.discountPrice ?? null,   // store discountPrice if exists
  slug: product.slug,
  thumbnail: product.thumbnail,
  attributes: variant.attributes,
  quantity,
  stock: variant.stock as number,
});
```

### Changes to `cart.repository.ts` -- `findByUser`

Include `discountPrice` in the select:

```typescript
.select({
  id: cartTable.id,
  userID: cartTable.userID,
  productID: cartTable.productID,
  variantID: cartTable.variantID,
  name: cartTable.name,
  price: cartTable.price,
  discountPrice: cartTable.discountPrice,
  slug: cartTable.slug,
  thumbnail: cartTable.thumbnail,
  attributes: cartTable.attributes,
  quantity: cartTable.quantity,
  stock: cartTable.stock,
  addedAt: cartTable.addedAt,
})
```

### Changes to `cart.store.ts` -- Cart Total Calculation

```typescript
// When computing cartTotal, use effective price per item:
const cartTotal = cart.reduce((sum, item) => {
  const effectivePrice = item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price
    ? item.discountPrice
    : item.price;
  return sum + effectivePrice * item.quantity;
}, 0);
```

### Migration

Run `bun run drizzle-kit generate` after schema changes, then apply migration.

---

## Frontend: Checkout Page

### Route

```
app/(with_footer)/checkout/page.tsx
```

### Middleware Update

Add `/checkout` to the protected routes in `middleware.ts`:

```typescript
const protectedRoutes = ["/user/:path*", "/cart", "/checkout"];
```

### Page Layout

```
+-----------------------------------------------------+
| Checkout                                    Step 2/3 |
+-----------------------------------------------------+
|                                                     |
|  +---------------------------+  +-----------------+  |
|  | Shipping Information      |  | Order Summary   |  |
|  |                           |  |                 |  |
|  | Full Name    [________]   |  | +-- Item 1 ---+ |  |
|  | Phone        [________]   |  | | img Name    | |  |
|  | Address      [________]   |  | | attrs       | |  |
|  | City         [________]   |  | | 350 x 2     | |  |
|  | Area         [________]   |  | +-------------+ |  |
|  |                           |  | +-- Item 2 ---+ |  |
|  | Note         [________]   |  | | img Name    | |  |
|  |                           |  | | attrs       | |  |
|  | Payment Method            |  | | 500 x 1     | |  |
|  | o Stripe (Card)           |  | +-------------+ |  |
|  | o Cash on Delivery        |  |                 |  |
|  |                           |  | Subtotal: 1200  |  |
|  |                           |  | Shipping: Free  |  |
|  |                           |  | Discount: -200  |  |
|  |                           |  | -------------   |  |
|  |                           |  | Total: 1000     |  |
|  |                           |  |                 |  |
|  |                           |  | [Place Order]   |  |
|  +---------------------------+  +-----------------+  |
|                                                     |
+-----------------------------------------------------+
```

### Component Structure

```
checkout/
  page.tsx                    # Main checkout page (client component)
  CheckoutForm.tsx            # Shipping info form
  OrderSummary.tsx            # Right sidebar with items + totals
  PaymentMethod.tsx           # Stripe / COD radio selection
```

### State Flow

```
1. Page loads -> fetch cart from store
2. If cart is empty -> redirect to /cart
3. User fills shipping form
4. User selects payment method
5. Click "Place Order"
6. POST /api/ecom/checkout { shipping, paymentMethod }
7. Backend: validates discount prices, creates ecom_order + items
8. Response:
   - If Stripe -> redirect to session.url (Stripe hosted checkout)
   - If COD -> redirect to /order/success?orderNo=ORD-xxx
9. After Stripe payment -> Stripe redirects to /order/success?session_id=xxx
10. /order/success page calls GET /api/ecom/order-success?session_id=xxx to confirm
```

### Frontend API Calls (new file: `ecommerce/utils/checkoutApi.ts`)

```typescript
import api from "./apiconfig";

export async function createOrder(payload: {
  shipping: {
    name: string;
    phone: string;
    address: string;
    city?: string;
    area?: string;
  };
  note?: string;
  paymentMethod: "stripe" | "cod";
}) {
  const res = await api.post("/ecom/checkout", payload);
  return res.data;
}

export async function getMyOrders(page = 1, limit = 10) {
  const res = await api.get(`/ecom/my-orders?page=${page}&limit=${limit}`);
  return res.data;
}

export async function getOrderDetail(orderNo: string) {
  const res = await api.get(`/ecom/my-orders/${orderNo}`);
  return res.data;
}

export async function cancelOrder(orderNo: string) {
  const res = await api.post(`/ecom/cancel/${orderNo}`);
  return res.data;
}

export async function confirmStripeOrder(sessionId: string) {
  const res = await api.get(`/ecom/order-success?session_id=${sessionId}`);
  return res.data;
}

// Public -- no auth needed
export async function getPublicOrder(orderNo: string) {
  const res = await api.get(`/ecom/order/${orderNo}`);
  return res.data;
}
```

### Frontend Types (new file: `ecommerce/types/order.types.ts`)

```typescript
export type OrderStatus = "pending" | "hold" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "failed";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type EcomOrderItem = {
  id: number;
  orderID: number;
  productID: number;
  variantID: number;
  productName: string;
  variantAttrs: { name: string; value: string }[];
  thumbnail: string | null;
  salePrice: number;
  discountPrice: number | null;
  quantity: number;
  lineTotal: number;
};

export type EcomOrder = {
  id: number;
  orderNo: string;
  saleID: number | null;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string | null;
  shippingArea: string | null;
  note: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: EcomOrderItem[];
};

export type EcomOrderListResponse = {
  orders: EcomOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
```

---

## Frontend: Order Confirmation Page

### Route

```
app/(with_footer)/order/success/page.tsx
```

### Behavior

1. Receives `session_id` query param (Stripe) or `orderNo` query param (COD)
2. Calls `GET /api/ecom/order-success?session_id=xxx` to confirm/verify the order
3. Displays success message with order details

### Layout

```
+-----------------------------------------+
|                                         |
|           check mark                    |
|     Order Placed Successfully!          |
|                                         |
|   Order No: ORD-20260722-000001        |
|   Status: Confirmed                     |
|   Payment: Paid (Stripe)                |
|   Total: 1,000                          |
|                                         |
|   [Track Order]  [Continue Shopping]    |
|                                         |
+-----------------------------------------+
```

---

## Frontend: Public Order Tracking Page

### Route

```
app/(with_footer)/track-order/page.tsx
```

### Behavior

1. **No auth required** -- public page accessible to anyone
2. User enters an order number in a search input
3. Calls `GET /api/ecom/order/:orderNo` (public endpoint)
4. Displays order details: status, items, totals, shipping info, timeline

### Layout

```
+----------------------------------------------+
| Track Your Order                              |
+----------------------------------------------+
|                                              |
|  Order Number: [ORD-20260722-000001] [Track] |
|                                              |
|  +----------------------------------------+  |
|  | Order: ORD-20260722-000001             |  |
|  | Status: Shipped                         |  |
|  | Payment: Paid                           |  |
|  | Placed: Jul 22, 2026                    |  |
|  +----------------------------------------+  |
|                                              |
|  Status Timeline:                            |
|  [x] Pending      Jul 22, 10:00 AM          |
|  [x] Confirmed    Jul 22, 10:05 AM          |
|  [x] Processing   Jul 22, 02:00 PM          |
|  [x] Shipped      Jul 23, 09:00 AM          |
|  [ ] Delivered                                  |
|                                              |
|  Items:                                      |
|  +----------------------------------------+  |
|  | img  Product Name (Color: Red)          |  |
|  |       350 TK x 2  =  700 TK            |  |
|  +----------------------------------------+  |
|  | img  Product Name (Size: L)             |  |
|  |       500 TK x 1  =  500 TK            |  |
|  +----------------------------------------+  |
|                                              |
|  Shipping To:                                |
|  John Doe                                    |
|  +880 1XXX-XXXXXX                           |  |
|  123 Main St, Dhaka                          |
|                                              |
|  Total: 1,200 TK                             |
|                                              |
+----------------------------------------------+
```

### Component Structure

```
track-order/
  page.tsx                    # Main tracking page with search input
  OrderTracker.tsx            # Displays order details + timeline
```

### Public API Endpoint (Backend)

```
GET /api/ecom/order/:orderNo
```

- **No auth middleware** -- accessible without login
- Returns order status, items, totals, shipping (no sensitive data like Stripe IDs)
- Returns 404 if order not found

---

## Frontend: My Orders Page

### Route

```
app/(dashboard)/user/my-orders/page.tsx
```

### Layout

```
+---------------------------------------------+
| My Orders                                   |
+---------------------------------------------+
|                                             |
| +-----------------------------------------+ |
| | ORD-20260722-000001                     | |
| | Status: Delivered  |  Total: 1,000      | |
| | 3 items  |  Placed: Jul 22, 2026        | |
| | [View Details]  [Track Order]           | |
| +-----------------------------------------+ |
|                                             |
| +-----------------------------------------+ |
| | ORD-20260720-000003                     | |
| | Status: Shipped   |  Total: 2,500       | |
| | 5 items  |  Placed: Jul 20, 2026        | |
| | [View Details]  [Track Order]           | |
| +-----------------------------------------+ |
|                                             |
|            [Load More]                      |
|                                             |
+---------------------------------------------+
```

### Order Detail (sub-route)

```
app/(dashboard)/user/my-orders/[orderNo]/page.tsx
```

Shows full order info: items, shipping address, payment status, timeline. Includes a "Track Order" link to the public tracking page.

---

## Flow Diagrams

### Checkout Flow (Stripe)

```
Customer                    Frontend                   Backend                  Stripe
   |                            |                         |                        |
   |-- Click "Place Order" --> |                         |                        |
   |                            |-- POST /ecom/checkout-> |                        |
   |                            |                         |-- Fetch cart items     |
   |                            |                         |-- Validate discount   |
   |                            |                         |   prices per item     |
   |                            |                         |-- Create ecom_order   |
   |                            |                         |-- Create ecom_order_  |
   |                            |                         |   items (snapshot)    |
   |                            |                         |-- Decrease stock      |
   |                            |                         |-- Clear cart          |
   |                            |                         |-- Create Stripe Sess. |
   |                            |                         |---------------------->|
   |                            |<-- { sessionUrl } -----|                        |
   |<-- Redirect to Stripe ----|                         |                        |
   |                            |                         |                        |
   |------- Pay on Stripe -------------------------------------------->|
   |                            |                         |                        |
   |                            |                         |<-- Webhook: completed -|
   |                            |                         |-- Create sale + items |
   |                            |                         |-- Link ecom_order     |
   |                            |                         |   .saleID to sale     |
   |                            |                         |-- Update: confirmed   |
   |                            |                         |                        |
   |<-- Redirect to /success -----------------------------------------|         |
   |                            |-- GET /order-success ->|                        |
   |                            |<-- order details ------|                        |
   |<-- See confirmation ------ |                         |                        |
```

### Checkout Flow (COD)

```
Customer                    Frontend                   Backend
   |                            |                         |
   |-- Click "Place Order" --> |                         |
   |                            |-- POST /ecom/checkout-> |
   |                            |                         |-- Fetch cart items
   |                            |                         |-- Validate discount prices
   |                            |                         |-- Create ecom_order
   |                            |                         |-- Create ecom_order_items
   |                            |                         |-- Decrease stock
   |                            |                         |-- Clear cart
   |                            |<-- { orderNo } --------|
   |<-- Redirect to /success --|                         |
   |<-- See confirmation ------ |                         |
   |                            |                         |
   | ... time passes ...        |                         |
   |                            |                         |
   | (Delivery / Payment)       | Admin confirms -------> |
   |                            |                         |-- Create sale + items
   |                            |                         |-- Link ecom_order
   |                            |                         |   .saleID to sale
```

### Cancel Order Flow

```
Customer                    Frontend                   Backend
   |                            |                         |
   |-- Click "Cancel" -------> |                         |
   |                            |-- POST /ecom/cancel --> |
   |                            |                         |-- Find ecom_order
   |                            |                         |-- Validate: status == "pending"
   |                            |                         |-- Update: status -> "cancelled"
   |                            |                         |-- Restore stock
   |                            |<-- success -------------|
   |<-- Order cancelled ------ |                         |
```

### Delete Order Flow (Admin)

```
Admin                        Frontend                   Backend
   |                            |                         |
   |-- Click "Delete" --------> |                         |
   |                            |-- DELETE /ecom/admin/..>|
   |                            |                         |-- Find ecom_order
   |                            |                         |-- If saleID exists:
   |                            |                         |     Delete sale (cascades
   |                            |                         |     to sale_items + ecom_order)
   |                            |                         |-- If saleID null:
   |                            |                         |     Delete items + order
   |                            |<-- success -------------|
   |<-- Order deleted --------- |                         |
```

### Public Order Tracking Flow

```
Visitor                     Frontend                   Backend
   |                            |                         |
   |-- Enter order number ---> |                         |
   |-- Click "Track" --------> |                         |
   |                            |-- GET /ecom/order/:no-> |
   |                            |                         |-- Find ecom_order
   |                            |                         |-- Fetch ecom_order_items
   |                            |                         |-- Return order details
   |                            |<-- order data ----------|
   |<-- Show order status ---- |                         |
```

---

## File Structure

### Backend New/Modified Files

```
backend/
+-- config/
|   +-- stripe.config.ts               # NEW -- Stripe client setup
|
+-- src/ecom/
|   +-- ecom.table.ts                   # MODIFY -- add ecomOrderTable, ecomOrderItemTable + relations
|   +-- ecom.type.ts                    # MODIFY -- add order types
|   +-- ecom.validator.ts               # MODIFY -- add order validation schemas
|   +-- ecom.repository.ts              # MODIFY -- add order CRUD methods
|   +-- ecom.service.ts                 # MODIFY -- add checkout, order tracking, webhook, cancel, delete
|   +-- ecom.controller.ts              # MODIFY -- add order handlers
|   +-- ecom.route.ts                   # MODIFY -- add order routes
|
+-- src/cart/cart.table.ts              # MODIFY -- add discountPrice column
+-- src/cart/cart.service.ts            # MODIFY -- store both salePrice and discountPrice
+-- src/cart/cart.repository.ts         # MODIFY -- include discountPrice in select
|
+-- src/sale/sale.service.ts            # (reuse existing -- no changes needed)
+-- src/sale/sale.repository.ts         # (reuse existing -- no changes needed)
|
+-- app.ts                              # MODIFY -- raw body for /api/ecom/stripe/webhook
+-- drizzle/src/db/schema.ts            # MODIFY -- export new ecom order tables
+-- utils/relations.ts                  # MODIFY -- add ecom order relations
+-- .env                                # MODIFY -- add Stripe keys
```

### Frontend New/Modified Files

```
ecommerce/
+-- app/(with_footer)/
|   +-- checkout/
|   |   +-- page.tsx                    # NEW -- checkout page
|   |   +-- CheckoutForm.tsx            # NEW -- shipping form
|   |   +-- OrderSummary.tsx            # NEW -- order summary sidebar
|   |   +-- PaymentMethod.tsx           # NEW -- payment method selector
|   +-- track-order/
|   |   +-- page.tsx                    # NEW -- public order tracking (no auth)
|   |   +-- OrderTracker.tsx            # NEW -- order status display component
|   +-- order/
|   |   +-- success/
|   |       +-- page.tsx               # NEW -- order confirmation
|   +-- cart/page.tsx                  # MODIFY -- fix discount display, link to /checkout
|
+-- app/(dashboard)/user/
|   +-- my-orders/
|       +-- page.tsx                    # NEW -- order list
|       +-- [orderNo]/
|           +-- page.tsx               # NEW -- order detail
|
+-- components/Sliders/CartSlider.tsx   # MODIFY -- fix discount display, link to /checkout
+-- components/Buttons/AddToCartButton.tsx  # (already fixed)
+-- components/Modals/VariantModal.tsx      # (already fixed)
|
+-- types/
|   +-- cart.types.ts                   # MODIFY -- add discountPrice field
|   +-- order.types.ts                  # NEW -- order types
|
+-- utils/
|   +-- checkoutApi.ts                  # NEW -- checkout + order API calls
|
+-- zustand/
|   +-- cart.store.ts                  # MODIFY -- update CartItem shape, cartTotal calc
|
+-- middleware.ts                        # MODIFY -- protect /checkout route
```

---

## Environment Variables

### Backend `.env` (add these)

```
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Ecommerce URL (already exists)
ECOM_CLIENT_URL=http://localhost:3000
```

### Frontend `.env` (no changes needed)

All Stripe interaction happens server-side. The frontend never handles Stripe keys directly.

---

## Implementation Order

### Phase 1: Fix Discount Price (cart + UI)

1. **Backend**: Add `discountPrice` column to `cart.table.ts`
2. **Backend**: Update `cart.service.ts` -- store both `salePrice` and `discountPrice`
3. **Backend**: Update `cart.repository.ts` -- include `discountPrice` in select
4. **Frontend**: Update `CartItem` type -- add `discountPrice`
5. **Frontend**: Update `cart.store.ts` -- handle `discountPrice` in `cartTotal` calculation
6. **Frontend**: Update `CartSlider.tsx` -- show strikethrough when discounted
7. **Frontend**: Update `cart/page.tsx` -- show strikethrough + correct total
8. **Run migration**: `bun run drizzle-kit generate && bun run drizzle-kit migrate`

### Phase 2: Backend Ecom Order + Stripe

1. Add `ecomOrderTable` + `ecomOrderItemTable` to `ecom.table.ts` + relations
2. Add order types to `ecom.type.ts`
3. Add order validators to `ecom.validator.ts`
4. Add order repository methods to `ecom.repository.ts`
5. Install Stripe: `bun add stripe`
6. Create `config/stripe.config.ts`
7. Add order service methods to `ecom.service.ts` (checkout + webhook + cancel + delete + public tracking)
8. Add order controller methods to `ecom.controller.ts`
9. Add order routes to `ecom.route.ts`
10. Update `app.ts` for raw body webhook parsing
11. Export new tables in `drizzle/src/db/schema.ts` + `utils/relations.ts`
12. Run migration
13. Test with Stripe test keys

### Phase 3: Frontend Checkout Flow

1. Create `ecommerce/types/order.types.ts`
2. Create `ecommerce/utils/checkoutApi.ts`
3. Create checkout page + components (`/checkout`)
4. Update `middleware.ts` to protect `/checkout`
5. Create order success page (`/order/success`)
6. Update CartSlider "Checkout" link -> `/checkout`
7. Update cart page "Proceed to Checkout" link -> `/checkout`

### Phase 4: Public Order Tracking

1. Create `/track-order/page.tsx` -- public tracking page (no auth)
2. Create `OrderTracker.tsx` -- order status display component

### Phase 5: My Orders

1. Create `/user/my-orders/page.tsx` -- order list
2. Create `/user/my-orders/[orderNo]/page.tsx` -- order detail

### Phase 6: Testing and Polish

1. Test full Stripe checkout flow with test keys
2. Test COD order flow (order first, sale after delivery)
3. Test discount price validation at checkout (valid discount, expired discount, no discount)
4. Test ecom_order + ecom_order_items creation at checkout
5. Test sale creation after Stripe payment (webhook)
6. Test sale creation for COD (admin confirm)
7. Test order cancellation (pending only) + stock restore
8. Test order deletion (admin) with cascade
9. Test public order tracking (no auth)
10. Test edge cases (empty cart, out of stock, expired session)
