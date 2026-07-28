# E-Commerce Checkout with Stripe -- Complete Flow

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Full Stripe Checkout Flow](#full-stripe-checkout-flow)
3. [COD Checkout Flow](#cod-checkout-flow)
4. [Backend Checkout Service -- Step by Step](#backend-checkout-service----step-by-step)
5. [Stripe Webhook Handling](#stripe-webhook-handling)
6. [Order Status State Machine](#order-status-state-machine)
7. [Cancel Order Flow](#cancel-order-flow)
8. [Admin: Confirm Sale (COD)](#admin-confirm-sale-cod)
9. [Admin: Delete Order](#admin-delete-order)
10. [Public Order Tracking](#public-order-tracking)
11. [API Endpoints Summary](#api-endpoints-summary)
12. [Database Tables & Relations](#database-tables--relations)

---

## High-Level Architecture

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │  REST   │                  │  REST   │                  │
│  Ecommerce App   │ ──────> │   Bun Backend    │ <────── │   Admin Panel    │
│   (Next.js)      │ <────── │   (Express)      │ ──────> │   (Vite+React)   │
│                  │         │                  │         │                  │
└────────┬─────────┘         └────────┬─────────┘         └──────────────────┘
         │                            │
         │                    ┌───────┴────────┐
         │                    │                │
         │              ┌─────▼─────┐   ┌──────▼──────┐
         │              │ PostgreSQL│   │   Stripe    │
         │              │  (Drizzle)│   │     API     │
         │              └───────────┘   └─────────────┘
         │
         │  Stripe Checkout Session
         │  (redirect)
         └──────────────────────────────────────> Stripe Hosted Page
                                                      │
                                              (payment done)
                                                      │
                                              Webhook ─┘
                                              POST /ecom/stripe/webhook
```

---

## Full Stripe Checkout Flow

```
 ┌─────────┐     ┌───────────┐     ┌────────────────┐     ┌─────────┐     ┌─────────┐
 │ Customer │     │ Frontend  │     │    Backend     │     │  Stripe │     │   DB    │
 └────┬────┘     └─────┬─────┘     └───────┬────────┘     └────┬────┘     └────┬────┘
      │                │                    │                    │               │
      │ 1. Click       │                    │                    │               │
      │ "Place Order"  │                    │                    │               │
      │───────────────>│                    │                    │               │
      │                │                    │                    │               │
      │                │ 2. POST            │                    │               │
      │                │ /ecom/checkout     │                    │               │
      │                │ {shipping,         │                    │               │
      │                │  paymentMethod:    │                    │               │
      │                │  "stripe"}         │                    │               │
      │                │───────────────────>│                    │               │
      │                │                    │                    │               │
      │                │                    │ 3. BEGIN TRANSACTION                │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │ 4. Fetch cart items│               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │ 5. For each item:  │               │
      │                │                    │    - Fetch variant  │               │
      │                │                    │    - Check stock    │               │
      │                │                    │    - Validate price │               │
      │                │                    │      (discount vs   │               │
      │                │                    │       salePrice)    │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │ 6. Generate         │               │
      │                │                    │    orderNo          │               │
      │                │                    │    ORD-YYYYMMDD-    │               │
      │                │                    │    XXXXXX           │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │ 7. INSERT           │               │
      │                │                    │    ecom_orders      │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │ 8. INSERT           │               │
      │                │                    │    ecom_order_items │               │
      │                │                    │    (price snapshot) │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │ 9. Decrease stock   │               │
      │                │                    │    (variant + prod) │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │ 10. Clear cart      │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │ 11. COMMIT TRANSACTION             │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │                    │               │
      │                │                    │ 12. Create Stripe  │               │
      │                │                    │ Checkout Session   │               │
      │                │                    │─────────────────────────────────>  │
      │                │                    │                    │               │
      │                │                    │ 13. Store          │               │
      │                │                    │     session.id on  │               │
      │                │                    │     ecom_order     │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │ 14. Return         │                    │               │
      │                │ { orderNo,         │                    │               │
      │                │   stripeSessionUrl}│                    │               │
      │                │<───────────────────│                    │               │
      │                │                    │                    │               │
      │ 15. Redirect   │                    │                    │               │
      │ to Stripe      │                    │                    │               │
      │ Checkout Page  │                    │                    │               │
      │<───────────────│                    │                    │               │
      │                │                    │                    │               │
      │                │                    │                    │               │
      │ ══════════════ STRIPE HOSTED CHECKOUT PAGE ════════════════════════════│
      │                │                    │                    │               │
      │ 16. Enter card │                    │                    │               │
      │ details & pay  │                    │                    │               │
      │──────────────────────────────────────────────────────>   │               │
      │                │                    │                    │               │
      │                │                    │ 17. Stripe sends   │               │
      │                │                    │     webhook event  │               │
      │                │                    │     to backend     │               │
      │                │                    │<───────────────────│               │
      │                │                    │                    │               │
      │                │                    │ 18. Verify         │               │
      │                │                    │     signature      │               │
      │                │                    │                    │               │
      │                │                    │ 19. Find order     │               │
      │                │                    │     by session id  │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │ 20. Create sale +  │               │
      │                │                    │     sale_items     │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │ 21. Link           │               │
      │                │                    │     order.saleID   │               │
      │                │                    │     = sale.id      │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │                    │ 22. Update order:  │               │
      │                │                    │  status = confirmed│               │
      │                │                    │  paymentStatus=paid│               │
      │                │                    │  paidAt = now      │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │ 23. Redirect   │                    │                    │               │
      │ to /order/     │                    │                    │               │
      │ success?       │                    │                    │               │
      │ session_id=xxx │                    │                    │               │
      │<────────────────────────────────────│                    │               │
      │                │                    │                    │               │
      │                │ 24. GET            │                    │               │
      │                │ /ecom/order-success│                    │               │
      │                │ ?session_id=xxx    │                    │               │
      │                │───────────────────>│                    │               │
      │                │                    │ 25. Retrieve       │               │
      │                │                    │     Stripe session │               │
      │                │                    │─────────────────────────────────>  │
      │                │                    │                    │               │
      │                │                    │ 26. Find order     │               │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │               │
      │                │ 27. Return order   │                    │               │
      │                │ details            │                    │               │
      │                │<───────────────────│                    │               │
      │                │                    │                    │               │
      │ 28. Show       │                    │                    │               │
      │ confirmation   │                    │                    │               │
      │ page           │                    │                    │               │
      │<───────────────│                    │                    │               │
      │                │                    │                    │               │
```

---

## COD Checkout Flow

```
 ┌─────────┐     ┌───────────┐     ┌────────────────┐     ┌─────────┐
 │ Customer │     │ Frontend  │     │    Backend     │     │   DB    │
 └────┬────┘     └─────┬─────┘     └───────┬────────┘     └────┬────┘
      │                │                    │                    │
      │ 1. Click       │                    │                    │
      │ "Place Order"  │                    │                    │
      │───────────────>│                    │                    │
      │                │                    │                    │
      │                │ 2. POST            │                    │
      │                │ /ecom/checkout     │                    │
      │                │ {shipping,         │                    │
      │                │  paymentMethod:    │                    │
      │                │  "cod"}            │                    │
      │                │───────────────────>│                    │
      │                │                    │                    │
      │                │                    │ 3. Same as Stripe:  │
      │                │                    │    fetch cart       │
      │                │                    │    validate prices  │
      │                │                    │    create order     │
      │                │                    │    create items     │
      │                │                    │    decrease stock   │
      │                │                    │    clear cart       │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │                    │ 4. Set order status │
      │                │                    │    = "confirmed"   │
      │                │                    │    (COD auto-confirm)
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │ 5. Return          │                    │
      │                │ { orderNo,         │                    │
      │                │   message }        │                    │
      │                │<───────────────────│                    │
      │                │                    │                    │
      │ 6. Redirect to │                    │                    │
      │ /order/success │                    │                    │
      │ ?orderNo=xxx   │                    │                    │
      │<───────────────│                    │                    │
      │                │                    │                    │
      │ ══════════════ TIME PASSES ══════════════════════════════│
      │                │                    │                    │
      │ (Delivery /    │                    │                    │
      │  Payment)      │                    │                    │
      │                │                    │                    │
      │                │              Admin confirms sale        │
      │                │              via admin panel            │
      │                │                    │                    │
      │                │                    │ 7. POST             │
      │                │                    │ /ecom/admin/order/  │
      │                │                    │ :orderNo/confirm-sale
      │                │                    │───────────────────> │
      │                │                    │                    │
      │                │                    │ 8. Create sale +   │
      │                │                    │     sale_items     │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │                    │ 9. Link            │
      │                │                    │    order.saleID    │
      │                │                    │───────────────────────────────────>│
```

---

## Backend Checkout Service -- Step by Step

```
EcomOrderService.createOrder(userID, input)
│
├─ Step 1: Fetch Cart Items
│  └─ Query cartTable WHERE userID = authenticated user
│  └─ Validate: cart must not be empty
│
├─ Step 2: Validate Each Item (loop)
│  ├─ Fetch variant from DB (real-time stock + price)
│  ├─ Validate: variant exists
│  ├─ Validate: variant.stock >= cart.quantity (stock check)
│  ├─ Validate discount price:
│  │   ├─ salePrice = variant.salePrice
│  │   ├─ IF variant.discountPrice exists AND > 0 AND < salePrice
│  │   │   └─ effectivePrice = variant.discountPrice  (discounted)
│  │   └─ ELSE
│  │       └─ effectivePrice = salePrice  (no discount)
│  ├─ lineTotal = effectivePrice * quantity
│  └─ lineDiscount = (salePrice - effectivePrice) * quantity
│
├─ Step 3: Compute Totals
│  ├─ subtotal = sum(lineTotal for all items)
│  ├─ totalDiscount = sum(lineDiscount for all items)
│  └─ totalAmount = subtotal  (shipping = 0 for now)
│
├─ Step 4: Generate Order Number
│  └─ Format: ORD-YYYYMMDD-XXXXXX (auto-increment per day)
│
├─ Step 5: Create ecom_orders row
│  ├─ status: "pending"
│  ├─ paymentStatus: "unpaid"
│  ├─ saleID: null  (set later after payment confirmation)
│  └─ All shipping info, pricing, stripe fields
│
├─ Step 6: Create ecom_order_items rows (one per cart item)
│  └─ Snapshot: product name, variant attrs, thumbnail,
│               salePrice, discountPrice, quantity, lineTotal
│
├─ Step 7: Decrease Stock
│  ├─ variantTable.stock -= quantity
│  └─ productTable.stock -= quantity
│
├─ Step 8: Clear Cart
│  └─ DELETE FROM cartTable WHERE userID = user
│
├─ Step 9: Branch -- Payment Method
│  │
│  ├─ IF "stripe":
│  │   ├─ Create Stripe Checkout Session
│  │   │   ├─ mode: "payment"
│  │   │   ├─ line_items: order items with prices (in cents)
│  │   │   ├─ success_url: /order/success?session_id={CHECKOUT_SESSION_ID}
│  │   │   ├─ cancel_url: /cart
│  │   │   └─ metadata: { orderNo }
│  │   ├─ Store session.id on ecom_order.stripeSessionID
│  │   └─ RETURN { orderNo, stripeSessionUrl }
│  │
│  └─ IF "cod":
│      ├─ Set order.status = "confirmed"
│      └─ RETURN { orderNo, message: "Order placed" }
│
└─ COMMIT TRANSACTION
```

---

## Stripe Webhook Handling

```
POST /api/ecom/stripe/webhook
(No auth -- raw body -- Stripe signature verification)

EcomService.handleStripeWebhook(event)
│
├─ Event: "checkout.session.completed"
│  │
│  ├─ Extract session.metadata.orderNo
│  ├─ Find ecom_order by orderNo
│  ├─ Skip if order not found or already has saleID
│  ├─ Create sale via SaleRepository.create()
│  │   └─ totalProductPrice, totalAmount, paid, discount, note
│  ├─ Update ecom_order:
│  │   ├─ saleID = new sale.id
│  │   ├─ status = "confirmed"
│  │   ├─ paymentStatus = "paid"
│  │   ├─ paidAt = now
│  │   └─ stripePaymentIntent = session.payment_intent
│  └─ (sale_items created by SaleRepository cascade)
│
├─ Event: "checkout.session.expired"
│  │
│  ├─ Extract session.metadata.orderNo
│  ├─ Find ecom_order by orderNo
│  ├─ Update order: status = "failed"
│  ├─ Restore stock for each order item:
│  │   ├─ variantTable.stock += item.quantity
│  │   └─ productTable.stock += item.quantity
│  └─ (No sale was created, so no sale to delete)
│
└─ Event: "charge.refunded"
   │
   ├─ Extract charge.payment_intent
   ├─ Find ecom_order by stripePaymentIntent
   └─ Update order: paymentStatus = "refunded"
```

---

## Order Status State Machine

```
                          ┌──────────────────────────────────────────────────────┐
                          │              ORDER STATUS FLOW                       │
                          └──────────────────────────────────────────────────────┘

   ┌─────────┐
   │ pending │ ◄── Order created, Stripe session opened, awaiting payment
   └────┬────┘
        │
        ├──► "stripe": awaiting Stripe payment
        │         │
        │         ├──► checkout.session.completed ──► confirmed
        │         ├──► checkout.session.expired   ──► failed (stock restored)
        │         └──► charge.refunded            ──► paymentStatus = refunded
        │
        ├──► "cod": auto-confirmed immediately
        │
        ├──► User cancels ──► cancelled (stock restored)
        │
        ▼
   ┌──────────┐
   │ confirmed│ ◄── Payment received (Stripe) or admin confirmed (COD)
   └────┬─────┘      Sale + sale_items created, linked via saleID
        │
        ▼
   ┌───────────┐
   │ processing│ ◄── Admin preparing the order
   └─────┬─────┘
         │
         ▼
   ┌─────────┐
   │ shipped │ ◄── Order shipped with tracking
   └────┬────┘
        │
        ▼
   ┌──────────┐
   │ delivered│ ◄── Customer received. For COD: sale created here
   └──────────┘

   ┌─────────┐
   │  hold   │ ◄── Admin review (fraud check, address verification)
   └────┬────┘
        │
        ├──► confirmed
        └──► cancelled


   ┌─────────┐
   │ failed  │ ◄── Stripe session expired or payment failed. Stock restored.
   └─────────┘

   ┌───────────┐
   │ cancelled │ ◄── Only from "pending". No sale created. Stock restored.
   └───────────┘
```

---

## Cancel Order Flow

```
 ┌─────────┐     ┌───────────┐     ┌────────────────┐     ┌─────────┐
 │ Customer │     │ Frontend  │     │    Backend     │     │   DB    │
 └────┬────┘     └─────┬─────┘     └───────┬────────┘     └────┬────┘
      │                │                    │                    │
      │ 1. Click       │                    │                    │
      │ "Cancel Order" │                    │                    │
      │───────────────>│                    │                    │
      │                │                    │                    │
      │                │ 2. POST            │                    │
      │                │ /ecom/cancel/      │                    │
      │                │ :orderNo           │                    │
      │                │───────────────────>│                    │
      │                │                    │                    │
      │                │                    │ 3. Find order       │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │                    │ 4. Validate:        │
      │                │                    │    status == "pending"
      │                │                    │    userID matches   │
      │                │                    │                    │
      │                │                    │ 5. BEGIN TRANSACTION                │
      │                │                    │                    │
      │                │                    │ 6. Update status    │
      │                │                    │    = "cancelled"   │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │                    │ 7. Restore stock    │
      │                │                    │    for each item:   │
      │                │                    │    variant += qty   │
      │                │                    │    product += qty   │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │                    │ 8. COMMIT           │
      │                │                    │                    │
      │                │ 9. Return success  │                    │
      │                │<───────────────────│                    │
      │                │                    │                    │
      │ 10. "Order     │                    │                    │
      │  cancelled"    │                    │                    │
      │<───────────────│                    │                    │
```

---

## Admin: Confirm Sale (COD)

```
 ┌─────────┐     ┌───────────┐     ┌────────────────┐     ┌─────────┐
 │  Admin   │     │Admin Panel│     │    Backend     │     │   DB    │
 └────┬────┘     └─────┬─────┘     └───────┬────────┘     └────┬────┘
      │                │                    │                    │
      │ 1. Click       │                    │                    │
      │ "Confirm Sale" │                    │                    │
      │───────────────>│                    │                    │
      │                │                    │                    │
      │                │ 2. POST            │                    │
      │                │ /ecom/admin/order/ │                    │
      │                │ :orderNo/          │                    │
      │                │ confirm-sale       │                    │
      │                │───────────────────>│                    │
      │                │                    │                    │
      │                │                    │ 3. Find order       │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │                    │ 4. Validate:        │
      │                │                    │    status in        │
      │                │                    │    [confirmed,      │
      │                │                    │     delivered]      │
      │                │                    │    saleID is null   │
      │                │                    │                    │
      │                │                    │ 5. Create sale +    │
      │                │                    │    sale_items       │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │                    │ 6. Link             │
      │                │                    │    order.saleID     │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │ 7. Return success  │                    │
      │                │<───────────────────│                    │
      │                │                    │                    │
      │ 8. Done        │                    │                    │
      │<───────────────│                    │                    │
```

---

## Admin: Delete Order

```
 ┌─────────┐     ┌───────────┐     ┌────────────────┐     ┌─────────┐
 │  Admin   │     │Admin Panel│     │    Backend     │     │   DB    │
 └────┬────┘     └─────┬─────┘     └───────┬────────┘     └────┬────┘
      │                │                    │                    │
      │ 1. Click       │                    │                    │
      │ "Delete Order" │                    │                    │
      │───────────────>│                    │                    │
      │                │                    │                    │
      │                │ 2. DELETE           │                    │
      │                │ /ecom/admin/order/ │                    │
      │                │ :orderNo           │                    │
      │                │───────────────────>│                    │
      │                │                    │                    │
      │                │                    │ 3. Find order       │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │                    │ 4. Branch:          │
      │                │                    │    IF saleID exists │
      │                │                    │    ├─ Delete sale   │
      │                │                    │    │  (cascades to  │
      │                │                    │    │   sale_items + │
      │                │                    │    │   ecom_order)  │
      │                │                    │    │                │
      │                │                    │    IF saleID null   │
      │                │                    │    ├─ Delete items  │
      │                │                    │    └─ Delete order  │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │ 5. Return success  │                    │
      │                │<───────────────────│                    │
```

---

## Public Order Tracking

```
 ┌─────────┐     ┌───────────┐     ┌────────────────┐     ┌─────────┐
 │ Visitor  │     │ Frontend  │     │    Backend     │     │   DB    │
 └────┬────┘     └─────┬─────┘     └───────┬────────┘     └────┬────┘
      │                │                    │                    │
      │ 1. Enter       │                    │                    │
      │ order number   │                    │                    │
      │ & click Track  │                    │                    │
      │───────────────>│                    │                    │
      │                │                    │                    │
      │                │ 2. GET              │                    │
      │                │ /ecom/order/:orderNo│                    │
      │                │ (NO auth required)  │                    │
      │                │───────────────────>│                    │
      │                │                    │                    │
      │                │                    │ 3. Find order       │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │                    │ 4. Fetch items      │
      │                │                    │───────────────────────────────────>│
      │                │                    │                    │
      │                │                    │ 5. Return           │
      │                │                    │    (NO sensitive    │
      │                │                    │     data: no stripe │
      │                │                    │     IDs, no saleID) │
      │                │<───────────────────│                    │
      │                │                    │                    │
      │ 6. Show order  │                    │                    │
      │ status, items, │                    │                    │
      │ timeline, etc  │                    │                    │
      │<───────────────│                    │                    │
```

---

## API Endpoints Summary

```
┌────────┬────────────────────────────────────┬────────────────────┬─────────────────────────┐
│ Method │ Path                               │ Auth               │ Description             │
├────────┼────────────────────────────────────┼────────────────────┼─────────────────────────┤
│ POST   │ /ecom/checkout                     │ authMiddleware     │ Create order + items    │
│        │                                    │ + validate         │ from cart (Stripe/COD)  │
├────────┼────────────────────────────────────┼────────────────────┼─────────────────────────┤
│ GET    │ /ecom/my-orders                    │ authMiddleware     │ List customer's orders  │
├────────┼────────────────────────────────────┼────────────────────┼─────────────────────────┤
│ GET    │ /ecom/my-orders/:orderNo           │ authMiddleware     │ Get single order detail │
├────────┼────────────────────────────────────┼────────────────────┼─────────────────────────┤
│ POST   │ /ecom/cancel/:orderNo              │ authMiddleware     │ Cancel pending order    │
├────────┼────────────────────────────────────┼────────────────────┼─────────────────────────┤
│ GET    │ /ecom/order-success                │ authMiddleware     │ Confirm after Stripe    │
│        │ ?session_id=xxx or ?orderNo=xxx    │                    │ redirect                │
├────────┼────────────────────────────────────┼────────────────────┼─────────────────────────┤
│ GET    │ /ecom/order/:orderNo               │ NO auth            │ Public order tracking   │
├────────┼────────────────────────────────────┼────────────────────┼─────────────────────────┤
│ POST   │ /ecom/stripe/webhook               │ NO auth            │ Stripe webhook handler  │
│        │ (raw body, Stripe signature)       │ (Stripe sig check) │ (session completed,     │
│        │                                    │                    │  expired, refunded)     │
├────────┼────────────────────────────────────┼────────────────────┼─────────────────────────┤
│ PATCH  │ /ecom/admin/order/:orderNo/status  │ auth + admin       │ Admin update order      │
│        │                                    │                    │ status                  │
├────────┼────────────────────────────────────┼────────────────────┼─────────────────────────┤
│ POST   │ /ecom/admin/order/:orderNo/        │ auth + admin       │ Admin create sale       │
│        │ confirm-sale                       │                    │ for COD order           │
├────────┼────────────────────────────────────┼────────────────────┼─────────────────────────┤
│ DELETE │ /ecom/admin/order/:orderNo         │ auth + admin       │ Admin delete order      │
└────────┴────────────────────────────────────┴────────────────────┴─────────────────────────┘
```

---

## Database Tables & Relations

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE RELATIONS                                     │
└──────────────────────────────────────────────────────────────────────────────────┘

  users                              cart
  ┌──────────────┐                  ┌──────────────────────────┐
  │ id (UUID) PK │◄─────────────────│ userID (UUID) FK         │
  │ ...          │                  │ productID (INT) FK       │
  └──────┬───────┘                  │ variantID (INT) FK       │
         │                          │ name, price, slug        │
         │                          │ discountPrice            │
         │                          │ quantity, stock          │
         │                          └──────────────────────────┘
         │
         │  ecom_orders
         │  ┌──────────────────────────────────────────────────┐
         │  │ id (SERIAL) PK                                   │
         ├─►│ userID (UUID) FK ──► users.id                    │
         │  │ saleID (INT) FK ──► sale.id  (nullable, set      │
         │  │                      after payment confirm)       │
         │  │ orderNo (VARCHAR) UNIQUE                          │
         │  │ status: pending/hold/confirmed/processing/        │
         │  │         shipped/delivered/cancelled/failed         │
         │  │                                                   │
         │  │ subtotal, shippingCost, discount, totalAmount     │
         │  │ paymentMethod: stripe | cod                       │
         │  │ paymentStatus: unpaid | paid | refunded           │
         │  │ stripeSessionID, stripePaymentIntent              │
         │  │ paidAt                                            │
         │  │                                                   │
         │  │ shippingName, shippingPhone, shippingAddress      │
         │  │ shippingCity, shippingArea, note                  │
         │  │                                                   │
         │  │ createdAt, updatedAt                              │
         │  └───────────────┬──────────────────────────────────┘
         │                  │
         │                  │ 1:N
         │                  ▼
         │  ecom_order_items
         │  ┌──────────────────────────────────────────────────┐
         │  │ id (SERIAL) PK                                   │
         │  │ orderID (INT) FK ──► ecom_orders.id (CASCADE)    │
         │  │ productID (INT) FK ──► products.id               │
         │  │ variantID (INT) FK ──► variants.id               │
         │  │                                                   │
         │  │ productName (snapshot)                            │
         │  │ variantAttrs (JSONB)                              │
         │  │ thumbnail (snapshot)                              │
         │  │                                                   │
         │  │ salePrice, discountPrice (validated at checkout)  │
         │  │ quantity, lineTotal                               │
         │  │                                                   │
         │  │ createdAt                                        │
         │  └──────────────────────────────────────────────────┘
         │
         │  sale (POS/Accounting - created after payment)
         │  ┌──────────────────────────────────────────────────┐
         │  │ id (SERIAL) PK                                   │
         ├─►│ totalProductPrice, totalAmount, paid, discount   │
         │  │ exchangeAmount, otherCost, balanceBefore/After   │
         │  │ saleDate, note                                   │
         │  └───────────────┬──────────────────────────────────┘
         │                  │
         │                  │ 1:N
         │                  ▼
         │  sale_items
         │  ┌──────────────────────────────────────────────────┐
         │  │ id (SERIAL) PK                                   │
         │  │ saleID (INT) FK ──► sale.id (CASCADE)            │
         │  │ batchID, productID, variantID                    │
         │  │ productName, unitPrice, quantity, lineTotal      │
         │  └──────────────────────────────────────────────────┘
         │
         │  KEY INSIGHT:
         │  ecom_order_items = "what the customer ordered"
         │  sale_items       = "what was invoiced/sold (accounting)"
         │  Linked via: ecom_order.saleID --> sale.id
```

---

## Key Concepts

### Why Two Order Systems (ecom_order vs sale)?

| Aspect | ecom_order | sale |
|--------|-----------|------|
| Created when | At checkout | After payment confirmation |
| Purpose | Customer-facing order record | Financial/inventory accounting |
| Items | ecom_order_items (snapshot) | sale_items (batch allocation) |
| COD timing | Immediately | On delivery/payment |
| Deletable by | Cancel (pending only) | Admin delete |

### Discount Price Validation

```
At checkout, for each cart item:
  1. Re-fetch variant from DB (real-time)
  2. IF variant.discountPrice exists
     AND > 0
     AND < variant.salePrice
     THEN  effectivePrice = discountPrice
     ELSE  effectivePrice = salePrice
  3. Order item stores BOTH prices for display
  4. lineTotal = effectivePrice * quantity
```

### Order Number Format

```
ORD-YYYYMMDD-XXXXXX

Example: ORD-20260728-000001
         ^^^^ ^^^^^^ ^^^^^^
         |    |      └── Auto-increment per day (zero-padded)
         |    └── Date (YYYYMMDD)
         └── Prefix
```

---

*Generated from backend source: `backend/src/ecom/`*
*Last Updated: 2026-07-28*
