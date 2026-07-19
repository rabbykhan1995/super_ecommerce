# Discount System — Variant Discounts + Promo Codes

This document explains the full discount system: permanent variant-level price discounts (via `variants.discountPrice`) and promo codes that apply at checkout to specific products. Flash sales already handle time-limited promotions — this system covers the rest.

---

## Table of Contents

- [Overview](#overview)
- [Current Pricing System](#current-pricing-system)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Price Resolution Logic](#price-resolution-logic)
- [Promo Code Logic](#promo-code-logic)
- [Admin Workflow](#admin-workflow)
- [Backend Changes](#backend-changes)
- [Frontend Changes](#frontend-changes)
- [API Endpoints](#api-endpoints)
- [ER Diagram](#er-diagram)
- [Files to Create & Modify](#files-to-create--modify)
- [Migration SQL](#migration-sql)

---

## Overview

| Feature | What It Does | Where It Lives | When It Applies |
|---------|-------------|----------------|-----------------|
| **Variant `discountPrice`** | Permanent lower price on a variant | `variants` table (new column) | Always on product page |
| **Promo Code** | Coupon-based discount at checkout | `promo_codes` + junction tables (new) | Only when customer enters code |
| **Flash Sale** | Time-limited promotional price | `flash_sale_products.discountPrice` (existing) | Only during sale event |
| **Offer Products** | Best-selling products sorted by sales | `products` table + sort (existing) | Always on homepage |

### Two Separate Discount Channels

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISCOUNT CHANNELS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CHANNEL 1: Product Page Display                                │
│  ├── Shows variant.discountPrice (permanent)                    │
│  ├── Shows flash sale discountPrice (time-limited)              │
│  └── Customer sees discounted price BEFORE adding to cart       │
│                                                                 │
│  CHANNEL 2: Checkout (Promo Code)                               │
│  ├── Customer enters a code at checkout                         │
│  ├── System validates code against specific products in cart    │
│  └── Additional discount applied to qualifying items            │
│                                                                 │
│  These are INDEPENDENT. A product can have BOTH a              │
│  discountPrice AND be eligible for promo codes.                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Pricing System

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXISTING PRICING LAYERS                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: products.salePrice                                    │
│  ├── Display / reference price                                  │
│  ├── Used for sorting, filtering, price range                   │
│  └── Shown as anchor price on product cards                     │
│                                                                 │
│  Layer 2: variants.salePrice                                    │
│  ├── The ACTUAL selling price per variant                       │
│  ├── Used at checkout / POS                                     │
│  └── Every product has >=1 variant                              │
│                                                                 │
│  Layer 3: flash_sale_products.discountPrice                     │
│  ├── Time-limited promotional override                          │
│  ├── Active only while flash sale is running                    │
│  └── LEFT JOINed into product listings                         │
│                                                                 │
│  MISSING:                                                       │
│  ├── Permanent variant-level discount                           │
│  └── Promo code / coupon system                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE DISCOUNT SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐    │
│  │   variants          │    │   flash_sale_products        │    │
│  │   .discountPrice    │    │   .discountPrice             │    │
│  │   (permanent)       │    │   (time-limited)             │    │
│  └─────────┬───────────┘    └──────────────┬──────────────┘    │
│            │                               │                    │
│            ▼                               ▼                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              PRODUCT PAGE DISPLAY                        │   │
│  │  Shows: salePrice (strikethrough) + discountPrice       │   │
│  │  Badge: "% OFF" when discountPrice < salePrice          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              CHECKOUT (PROMO CODE)                       │   │
│  │                                                         │   │
│  │  Customer enters code                                   │   │
│  │       ↓                                                 │   │
│  │  Validate promo_codes table                             │   │
│  │       ↓                                                 │   │
│  │  Check promo_code_products (which products qualify)     │   │
│  │       ↓                                                 │   │
│  │  Check promo_code_variants (optional: specific variants)│   │
│  │       ↓                                                 │   │
│  │  Apply discount to qualifying cart items                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Existing: `variants` table — add one column

```sql
variants
├── ...existing columns...
├── salePrice        NUMERIC(12,2)  ← original price
├── discountPrice    NUMERIC(12,2)  ← NEW: permanent discounted price (nullable)
```

- `NULL` or `>= salePrice` → no discount
- `< salePrice` → shows as discounted on product page

### New: `promo_codes` table

```sql
promo_codes
├── id              SERIAL PRIMARY KEY
├── code            VARCHAR(50) UNIQUE NOT NULL     -- "SAVE20", "WINTER30"
├── type            VARCHAR(10) NOT NULL            -- 'percentage' | 'flat'
├── value           NUMERIC(12,2) NOT NULL          -- 20 (for 20%) or 500 (for ৳500 off)
├── maxDiscountAmount NUMERIC(12,2)                 -- cap for percentage (nullable)
├── minOrderAmount  NUMERIC(12,2)                   -- minimum cart total (nullable)
├── usageLimit      INTEGER                          -- max total uses (nullable = unlimited)
├── usedCount       INTEGER DEFAULT 0                -- current usage counter
├── startDate       TIMESTAMP WITH TIME ZONE         -- nullable = always active
├── endDate         TIMESTAMP WITH TIME ZONE         -- nullable = always active
├── isActive        BOOLEAN DEFAULT true
├── createdAt       TIMESTAMP WITH TIME ZONE
└── updatedAt       TIMESTAMP WITH TIME ZONE
```

### New: `promo_code_products` junction table (M:N)

```sql
promo_code_products
├── id              SERIAL PRIMARY KEY
├── promoCodeID     INTEGER NOT NULL FK → promo_codes.id (CASCADE DELETE)
├── productID       INTEGER NOT NULL FK → products.id (CASCADE DELETE)
└── UNIQUE(promoCodeID, productID)
```

**One promo code → many products. One product → many promo codes.**

### New: `promo_code_variants` junction table (M:N, optional)

```sql
promo_code_variants
├── id              SERIAL PRIMARY KEY
├── promoCodeID     INTEGER NOT NULL FK → promo_codes.id (CASCADE DELETE)
├── variantID       INTEGER NOT NULL FK → variants.id (CASCADE DELETE)
└── UNIQUE(promoCodeID, variantID)
```

**Optional.** When populated, the promo code only works for those specific variants. When empty, the code works for ALL variants of the linked products.

---

## Price Resolution Logic

### Product Page (Before Checkout)

Priority order for what the customer sees:

```
1. Flash sale discountPrice       (highest priority — time-limited)
   ↓ if no active flash sale
2. Variant discountPrice          (permanent — always active)
   ↓ if discountPrice is NULL or >= salePrice
3. Variant salePrice              (original price — no discount)
```

| Flash Sale Active? | Variant `discountPrice` | Displayed Price | Strikethrough | "% OFF" Badge |
|--------------------|------------------------|-----------------|---------------|---------------|
| Yes | Any | Flash `discountPrice` | `salePrice` | Yes |
| No | `< salePrice` | `discountPrice` | `salePrice` | Yes |
| No | `NULL` or `>= salePrice` | `salePrice` | No | No |

### Checkout (After Promo Code Entry)

```
Customer enters promo code "SAVE20"
    ↓
1. Find promo_codes row where code = "SAVE20" AND isActive = true
   → If not found → "Invalid promo code"
    ↓
2. Check usageLimit vs usedCount
   → If exceeded → "Usage limit reached"
    ↓
3. Check startDate / endDate
   → If expired → "Promo code has expired"
    ↓
4. Find all products in promo_code_products for this code
   → Filter cart items to only those products
   → If no matching products in cart → "This code doesn't apply to items in your cart"
    ↓
5. Check promo_code_variants (if any entries exist)
   → Further filter to only those specific variants
    ↓
6. Calculate discount on qualifying items:
   - type = "percentage": discountPrice = price - (price * value / 100)
     capped at maxDiscountAmount if set
   - type = "flat": discountPrice = price - value
    ↓
7. Check minOrderAmount
   → If cart subtotal < minOrderAmount → "Minimum order is ৳XXX"
    ↓
8. Apply discount to sale total
```

### Important: Two Discounts Can Stack

A product can have BOTH:
- `variant.discountPrice` — shown on product page (already reduced price)
- Promo code discount — applied at checkout on top

**Example:**
```
Variant salePrice:      ৳10,000
Variant discountPrice:   ৳8,000  (shown on product page — 20% off)
Promo code "FLAT1000":  -৳1,000  (applied at checkout)
Final price customer pays: ৳7,000
```

---

## Promo Code Logic

### Many-to-Many Relationships

```
One promo code ───M:N─── products
One promo code ───M:N─── variants (optional)

Examples:
├── Code "SAVE20" → applies to [Samsung Galaxy, iPhone, Pixel]
├── Code "NIKE50" → applies to [all Nike products]
├── Code "FLASH10" → applies to [Product X variant "128GB Black"] (variant-specific)
└── Code "WELCOME" → applies to [all products] (no entries in promo_code_products = all products)
```

### Validation Flow

```typescript
async function validatePromoCode(code: string, cartItems: CartItem[]) {
  // 1. Find the promo code
  const promoCode = await db.query.promoCodeTable.findFirst({
    where: eq(promoCodeTable.code, code.toUpperCase()),
    with: { products: true, variants: true },
  });

  if (!promoCode || !promoCode.isActive) {
    return { valid: false, error: "Invalid promo code" };
  }

  // 2. Check usage limits
  if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
    return { valid: false, error: "Usage limit reached" };
  }

  // 3. Check date range
  const now = new Date();
  if (promoCode.startDate && now < promoCode.startDate) {
    return { valid: false, error: "This code is not active yet" };
  }
  if (promoCode.endDate && now > promoCode.endDate) {
    return { valid: false, error: "This code has expired" };
  }

  // 4. Find qualifying products
  const qualifyingProductIDs = promoCode.products.map(p => p.productID);

  // If no products linked → code applies to ALL products
  const qualifyingItems = qualifyingProductIDs.length === 0
    ? cartItems
    : cartItems.filter(item => qualifyingProductIDs.includes(item.productID));

  if (qualifyingItems.length === 0) {
    return { valid: false, error: "This code doesn't apply to items in your cart" };
  }

  // 5. Check variant restrictions (if any)
  const qualifyingVariants = promoCode.variants.map(v => v.variantID);
  const finalItems = qualifyingVariants.length === 0
    ? qualifyingItems
    : qualifyingItems.filter(item => qualifyingVariants.includes(item.variantID));

  // 6. Calculate discount
  let totalDiscount = 0;
  for (const item of finalItems) {
    const price = item.discountPrice ?? item.salePrice;
    if (promoCode.type === "percentage") {
      let discount = (price * promoCode.value) / 100;
      if (promoCode.maxDiscountAmount) {
        discount = Math.min(discount, promoCode.maxDiscountAmount);
      }
      totalDiscount += discount * item.quantity;
    } else {
      totalDiscount += promoCode.value * item.quantity;
    }
  }

  // 7. Check minimum order
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.discountPrice ?? item.salePrice;
    return sum + price * item.quantity;
  }, 0);

  if (promoCode.minOrderAmount && cartTotal < promoCode.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order amount is ৳${promoCode.minOrderAmount}`,
    };
  }

  return {
    valid: true,
    discount: totalDiscount,
    promoCode: {
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
    },
  };
}
```

---

## Admin Workflow

### 1. Set Variant Discount Price (Permanent)

Admin navigates to **Products → Edit Product**:

```
VARIANT EDITING TABLE
┌──────────────┬────────────┬─────────────────┬───────┐
│ Attributes   │ Sale Price │ Discount Price  │ Stock │
├──────────────┼────────────┼─────────────────┼───────┤
│ 128GB Black  │ ৳35,000    │ ৳29,999         │ 50    │
│ 256GB Silver │ ৳42,000    │ (empty)         │ 30    │
│ 512GB Gold   │ ৳55,000    │ ৳48,000         │ 15    │
└──────────────┴────────────┴─────────────────┴───────┘
```

**Result:** 128GB Black and 512GB Gold show "% OFF" badges on the product page. 256GB Silver shows full price.

### 2. Create a Promo Code

Admin navigates to **Discounts → Promo Codes → Create**:

| Field | Required | Description |
|-------|----------|-------------|
| Code | Yes | e.g. "SAVE20" (auto-uppercased) |
| Type | Yes | Percentage or Flat |
| Value | Yes | e.g. 20 (for 20%) or 500 (for ৳500 off) |
| Max Discount Amount | No | Cap for percentage discounts |
| Min Order Amount | No | Minimum cart total to qualify |
| Usage Limit | No | Leave empty for unlimited |
| Start Date | No | Leave empty for always active |
| End Date | No | Leave empty for always active |
| Is Active | Yes | Enable/disable toggle |

### 3. Assign Products to Promo Code

Admin navigates to **Discounts → Promo Codes → Manage Products**:

1. Selects the promo code from a dropdown
2. Picks products from a searchable selector
3. Products are linked in `promo_code_products`

**If no products linked:** Code applies to ALL products.

### 4. (Optional) Assign Specific Variants

If the admin wants the code to work only for certain variants:

1. Selects the promo code + product
2. Picks specific variants
3. Variants are linked in `promo_code_variants`

**If no variants linked:** Code works for ALL variants of the linked products.

### Visual Flow

```
ADMIN PANEL
├── Products
│   └── Edit Product
│       └── Variant Table → Set discountPrice per variant
│
└── Discounts
    ├── Promo Codes
    │   ├── Code List            → View all codes with usage stats
    │   ├── Create Code          → Fill code details (type, value, limits)
    │   ├── Edit Code            → Modify code details
    │   └── Toggle Active        → Enable/disable a code
    │
    ├── Code Products
    │   ├── Assign Products      → Link products to a promo code
    │   └── Remove Products      → Unlink products from a promo code
    │
    └── Code Variants (Optional)
        ├── Assign Variants      → Link specific variants to a code
        └── Remove Variants      → Unlink variants from a code
```

---

## Backend Changes

### 1. New Table: `promo_codes` (`backend/src/discount/discount.table.ts`)

```typescript
import { relations } from "drizzle-orm";
import {
  pgTable, serial, varchar, timestamp, integer, numeric, boolean,
} from "drizzle-orm/pg-core";
import { productTable } from "../product/product.table";
import { variantTable } from "../product/variant.table";

export const promoCodeTable = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  type: varchar("type", { length: 10 }).notNull(),           // 'percentage' | 'flat'
  value: numeric("value", { precision: 12, scale: 2, mode: "number" }).notNull(),
  maxDiscountAmount: numeric("max_discount_amount", { precision: 12, scale: 2, mode: "number" }),
  minOrderAmount: numeric("min_order_amount", { precision: 12, scale: 2, mode: "number" }),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const promoCodeRelations = relations(promoCodeTable, ({ many }) => ({
  products: many(promoCodeProductTable),
  variants: many(promoCodeVariantTable),
}));

// ─── Promo Code Products (M:N) ─────────────────────────────────────────────

export const promoCodeProductTable = pgTable("promo_code_products", {
  id: serial("id").primaryKey(),
  promoCodeID: integer("promo_code_id").notNull()
    .references(() => promoCodeTable.id, { onDelete: "cascade" }),
  productID: integer("product_id").notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
});

export const promoCodeProductRelations = relations(promoCodeProductTable, ({ one }) => ({
  promoCode: one(promoCodeTable, {
    fields: [promoCodeProductTable.promoCodeID],
    references: [promoCodeTable.id],
  }),
  product: one(productTable, {
    fields: [promoCodeProductTable.productID],
    references: [productTable.id],
  }),
}));

// ─── Promo Code Variants (M:N, optional) ───────────────────────────────────

export const promoCodeVariantTable = pgTable("promo_code_variants", {
  id: serial("id").primaryKey(),
  promoCodeID: integer("promo_code_id").notNull()
    .references(() => promoCodeTable.id, { onDelete: "cascade" }),
  variantID: integer("variant_id").notNull()
    .references(() => variantTable.id, { onDelete: "cascade" }),
});

export const promoCodeVariantRelations = relations(promoCodeVariantTable, ({ one }) => ({
  promoCode: one(promoCodeTable, {
    fields: [promoCodeVariantTable.promoCodeID],
    references: [promoCodeTable.id],
  }),
  variant: one(variantTable, {
    fields: [promoCodeVariantTable.variantID],
    references: [variantTable.id],
  }),
}));
```

### 2. Variant Table (`variant.table.ts`)

Add `discountPrice` column:

```typescript
export const variantTable = pgTable("variants", {
  // ...existing columns...
  salePrice: numeric("sale_price", { mode: "number", precision: 12, scale: 2 }).default(0),
  discountPrice: numeric("discount_price", { mode: "number", precision: 12, scale: 2 }),  // NEW
  // ...rest of columns...
});
```

### 3. Product Table (`product.table.ts`)

Add reverse relations:

```typescript
export const productRelations = relations(productTable, ({ one, many }) => ({
  // ...existing relations...
  promoCodeProducts: many(promoCodeProductTable),
}));
```

### 4. Variant Table (`variant.table.ts`)

Add reverse relation:

```typescript
export const variantRelations = relations(variantTable, ({ one, many }) => ({
  // ...existing relations...
  promoCodeVariants: many(promoCodeVariantTable),
}));
```

### 5. Schema Barrel (`backend/drizzle/src/db/schema.ts`)

Register new tables:

```typescript
export * from "../../src/discount/discount.table";
```

### 6. Route Mounting (`backend/routes/allRoutes.ts`)

```typescript
import discountRoutes from "../../src/discount/discount.route";

// In allRoutes:
app.use("/api/discount", discountRoutes);
```

### 7. Validator (`backend/src/discount/discount.validator.ts`)

```typescript
import { z } from "zod";

export const createPromoCodeSchema = z.object({
  code: z.string().min(3).max(50).transform(v => v.toUpperCase()),
  type: z.enum(["percentage", "flat"]),
  value: z.number().min(0),
  maxDiscountAmount: z.number().min(0).optional().nullable(),
  minOrderAmount: z.number().min(0).optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updatePromoCodeSchema = createPromoCodeSchema.partial();

export const assignPromoCodeProductSchema = z.object({
  promoCodeID: z.number().int(),
  productID: z.number().int(),
});

export const assignPromoCodeVariantSchema = z.object({
  promoCodeID: z.number().int(),
  variantID: z.number().int(),
});

export const validatePromoCodeSchema = z.object({
  code: z.string().min(1),
  cartItems: z.array(z.object({
    productID: z.number().int(),
    variantID: z.number().int(),
    salePrice: z.number(),
    discountPrice: z.number().optional().nullable(),
    quantity: z.number().min(1),
  })),
});
```

### 8. Variant Validator (`variant.validator.ts`)

Add `discountPrice`:

```typescript
export const variantItemSchema = z.object({
  // ...existing fields...
  discountPrice: z.number().min(0).optional().nullable(),
});
```

### 9. Ecom Repository (`ecom.repository.ts`)

Update product listing query to also pick up variant `discountPrice`:

```typescript
// Add LEFT JOIN to variantTable
.leftJoin(variantTable, eq(variantTable.productID, productTable.id))

// Add to select
discountPrice: variantTable.discountPrice,
```

### 10. Ecom Service (`ecom.service.ts`)

Update price resolution to use variant `discountPrice`:

```typescript
// For each product, resolve the effective discountPrice
function resolveDiscountPrice(flashSaleDiscount, variantDiscount, salePrice) {
  // Priority 1: Flash sale
  if (flashSaleDiscount && flashSaleDiscount < salePrice) {
    return flashSaleDiscount;
  }
  // Priority 2: Variant permanent discount
  if (variantDiscount && variantDiscount < salePrice) {
    return variantDiscount;
  }
  // No discount
  return null;
}
```

---

## Frontend Changes

### 1. Fix ProductCard Discount Display

**File:** `ecommerce/components/Cards/ProductCard.tsx`

**Current bug (lines 227-233):** Shows `product.salePrice` as both the green price AND the strikethrough.

**Fix:**

```tsx
<div className="flex gap-2 items-center text-sm font-bold">
  <span className="text-green-600 text-xs sm:text-sm">
    ৳ {hasDiscount ? product.discountPrice!.toFixed(2) : product.salePrice.toFixed(2)}
  </span>
  {hasDiscount && (
    <del className="text-zinc-400 font-medium text-xs sm:text-sm">
      ৳ {product.salePrice}
    </del>
  )}
</div>
```

### 2. Checkout Promo Code Input

Add to the checkout page:

```tsx
<div className="promo-code-section">
  <input
    type="text"
    placeholder="Enter promo code"
    value={promoCode}
    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
  />
  <button onClick={handleApplyPromoCode}>Apply</button>
  {promoCodeError && <p className="text-red-500">{promoCodeError}</p>}
  {promoCodeDiscount && (
    <div className="text-green-600">
      <p>Code "{promoCodeDiscount.code}" applied!</p>
      <p>Discount: ৳{promoCodeDiscount.discount.toFixed(2)}</p>
    </div>
  )}
</div>
```

### 3. VariantModal

**File:** `ecommerce/components/Modals/VariantModal.tsx`

Show resolved variant price:

```tsx
const variantPrice = selectedVariant?.discountPrice && selectedVariant.discountPrice < selectedVariant.salePrice
  ? selectedVariant.discountPrice
  : selectedVariant?.salePrice ?? product.salePrice;
```

### 4. EcomProduct Type

**File:** `ecommerce/types/product.types.ts`

Already has `discountPrice: number | null`. Ensure backend populates it correctly.

---

## API Endpoints

### Promo Code Management (Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/discount/promo-code/create` | Admin | Create a promo code |
| PUT | `/discount/promo-code/update/:id` | Admin | Update a promo code |
| DELETE | `/discount/promo-code/delete/:id` | Admin | Delete a promo code (cascades) |
| GET | `/discount/promo-code/list` | Admin | List all promo codes (paginated) |
| GET | `/discount/promo-code/:id` | Admin | Get promo code details with products/variants |

### Promo Code Products (Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/discount/promo-code/assign-product` | Admin | Assign product to promo code |
| DELETE | `/discount/promo-code/remove-product/:promoCodeID/:productID` | Admin | Remove product from promo code |
| GET | `/discount/promo-code/products/:promoCodeID` | Admin | List products linked to a promo code |

### Promo Code Variants (Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/discount/promo-code/assign-variant` | Admin | Assign variant to promo code |
| DELETE | `/discount/promo-code/remove-variant/:promoCodeID/:variantID` | Admin | Remove variant from promo code |
| GET | `/discount/promo-code/variants/:promoCodeID` | Admin | List variants linked to a promo code |

### Public (Checkout)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/discount/promo-code/validate` | Public | Validate a promo code + return discount amount |

---

## ER Diagram

```
┌─────────────────┐         ┌──────────────────────────┐         ┌──────────────┐
│   promo_codes   │         │   promo_code_products    │         │   products   │
├─────────────────┤         ├──────────────────────────┤         ├──────────────┤
│ id (PK)         │──1:M────│ id (PK)                  │──M:1────│ id (PK)      │
│ code (UNIQUE)   │         │ promoCodeID (FK)         │         │ name         │
│ type            │         │ productID (FK)           │         │ salePrice    │
│ value           │         └──────────────────────────┘         │ ...          │
│ maxDiscount     │                                              └──────────────┘
│ minOrder        │         ┌──────────────────────────┐            │
│ usageLimit      │         │   promo_code_variants    │            │ 1:M
│ usedCount       │         ├──────────────────────────┤         ┌──────────────┐
│ startDate       │──1:M────│ id (PK)                  │──M:1────│  variants    │
│ endDate         │         │ promoCodeID (FK)         │         ├──────────────┤
│ isActive        │         │ variantID (FK)           │         │ id (PK)      │
│ createdAt       │         └──────────────────────────┘         │ productID(FK)│
│ updatedAt       │                                              │ salePrice    │
└─────────────────┘                                              │ discountPrice│  ← NEW
                                                                 │ ...          │
                                                                 └──────────────┘

Existing (unchanged):
  products ──1:M── variants
  products ──1:M── flash_sale_products ──M:1── flash_sales
```

---

## Files to Create & Modify

### New Files (Create)

| File | Purpose |
|------|---------|
| `backend/src/discount/discount.table.ts` | Drizzle table definitions (promo_codes, promo_code_products, promo_code_variants) |
| `backend/src/discount/discount.type.ts` | TypeScript type definitions |
| `backend/src/discount/discount.validator.ts` | Zod validation schemas |
| `backend/src/discount/discount.repository.ts` | Database queries |
| `backend/src/discount/discount.service.ts` | Business logic + Redis cache |
| `backend/src/discount/discount.controller.ts` | HTTP request handlers |
| `backend/src/discount/discount.route.ts` | Express route definitions |
| `admin/src/pages/Discount/PromoCodeManagement.tsx` | Promo code CRUD admin page |
| `docs/DISCOUNT_SYSTEM.md` | This document |

### Existing Files (Modify)

| File | Changes |
|------|---------|
| `backend/src/product/variant.table.ts` | Add `discountPrice` column + `promoCodeVariants` relation |
| `backend/src/product/product.table.ts` | Add `promoCodeProducts` relation |
| `backend/src/product/variant.validator.ts` | Add `discountPrice` to variant schema |
| `backend/src/product/product.repository.ts` | Include `discountPrice` in variant queries |
| `backend/src/product/product.service.ts` | Handle `discountPrice` in create/update |
| `backend/src/ecom/ecom.repository.ts` | JOIN variant table for `discountPrice` in product listings |
| `backend/src/ecom/ecom.service.ts` | Resolve price: flash sale > variant discount > original |
| `backend/drizzle/src/db/schema.ts` | Register discount tables in schema barrel |
| `backend/routes/allRoutes.ts` | Mount `/api/discount` route |
| `admin/src/pages/Product/NewProduct.tsx` | Add discountPrice input to variant form |
| `admin/src/pages/Product/EditProduct.tsx` | Add discountPrice input to variant form |
| `admin/src/types/type.ts` | Add PromoCode types |
| `admin/src/validators/product.validator.ts` | Add `discountPrice` to variant validation |
| `admin/src/routes/admin.routes.tsx` | Add Discount nav items to sidebar |
| `admin/src/routes/router.tsx` | Add Discount route definitions |
| `ecommerce/components/Cards/ProductCard.tsx` | Fix discount display bug |
| `ecommerce/types/product.types.ts` | Ensure `discountPrice` is populated correctly |
| `ecommerce/components/Modals/VariantModal.tsx` | Show resolved variant price |

---

## Migration SQL

```sql
-- ============================================
-- Discount System Migration
-- ============================================

-- 1. Add discount_price to variants
ALTER TABLE "variants"
ADD COLUMN "discount_price" numeric(12,2);

-- 2. promo_codes table
CREATE TABLE "promo_codes" (
  "id" serial PRIMARY KEY,
  "code" varchar(50) UNIQUE NOT NULL,
  "type" varchar(10) NOT NULL,
  "value" numeric(12,2) NOT NULL,
  "max_discount_amount" numeric(12,2),
  "min_order_amount" numeric(12,2),
  "usage_limit" integer,
  "used_count" integer DEFAULT 0 NOT NULL,
  "start_date" timestamp with time zone,
  "end_date" timestamp with time zone,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. promo_code_products junction table
CREATE TABLE "promo_code_products" (
  "id" serial PRIMARY KEY,
  "promo_code_id" integer NOT NULL REFERENCES "promo_codes"("id") ON DELETE CASCADE,
  "product_id" integer NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  UNIQUE("promo_code_id", "product_id")
);

-- 4. promo_code_variants junction table
CREATE TABLE "promo_code_variants" (
  "id" serial PRIMARY KEY,
  "promo_code_id" integer NOT NULL REFERENCES "promo_codes"("id") ON DELETE CASCADE,
  "variant_id" integer NOT NULL REFERENCES "variants"("id") ON DELETE CASCADE,
  UNIQUE("promo_code_id", "variant_id")
);

-- Indexes
CREATE INDEX "promo_code_products_promo_code_id_idx" ON "promo_code_products" ("promo_code_id");
CREATE INDEX "promo_code_products_product_id_idx" ON "promo_code_products" ("product_id");
CREATE INDEX "promo_code_variants_promo_code_id_idx" ON "promo_code_variants" ("promo_code_id");
CREATE INDEX "promo_code_variants_variant_id_idx" ON "promo_code_variants" ("variant_id");
CREATE INDEX "promo_codes_code_idx" ON "promo_codes" ("code");
```

**Rollback (if needed):**
```sql
DROP TABLE "promo_code_variants";
DROP TABLE "promo_code_products";
DROP TABLE "promo_codes";
ALTER TABLE "variants" DROP COLUMN "discount_price";
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **New column** | `variants.discountPrice` (permanent, nullable) |
| **New tables** | `promo_codes`, `promo_code_products`, `promo_code_variants` |
| **Promo code scope** | Many-to-many: one code → many products, one product → many codes |
| **Variant restriction** | Optional: promo code can target specific variants |
| **Discount stacking** | `discountPrice` (product page) + promo code (checkout) can stack |
| **Resolution priority** | Flash sale > Variant discount > Original price |
| **Promo code validation** | Code → products → variants → usage limits → date range → min order |
| **Admin workflow** | Set discountPrice per variant + create promo codes + assign products |
| **Frontend** | ProductCard fix, checkout promo input, variant modal update |
| **Files to create** | 9 new files |
| **Files to modify** | 18 existing files |
| **Migration** | 1 ALTER TABLE + 3 CREATE TABLE |
