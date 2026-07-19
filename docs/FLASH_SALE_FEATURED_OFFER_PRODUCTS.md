# Flash Sales, Featured Products & Offer Products — Complete Analogy

This document explains how the three promotional product display systems (Flash Sale, Featured Products, and Offer Products) work in this ecommerce project — from admin creation to database storage to frontend display.

---

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Flash Sales](#1-flash-sales)
- [Featured Products](#2-featured-products)
- [Offer Products](#3-offer-products)
- [Cache & Revalidation](#cache--revalidation-system)
- [Admin Workflow Summary](#admin-workflow-summary)
- [Frontend Display Summary](#frontend-display-summary)

---

## Overview

| Feature | DB Table | Admin Page | Public Endpoint | Homepage Section |
|---|---|---|---|---|
| Flash Sale | `flash_sales` + `flash_sale_products` | FlashSale + FlashProduct | `/ecom/flash-products` | Countdown carousel |
| Featured Products | `featured_products` | FeatureProduct | `/ecom/featured` | Star-rated grid |
| Offer Products | *(none — derived from catalog)* | *(none)* | `/ecom/offers` | Best-selling grid |

---

## Database Schema

All e-commerce display tables are defined in `backend/src/ecom/ecom.table.ts`.

### `flash_sales`

```sql
flash_sales
├── id            SERIAL PRIMARY KEY
├── name          VARCHAR(200)
├── startDate     TIMESTAMP WITH TIME ZONE
├── endDate       TIMESTAMP WITH TIME ZONE
├── isActive      BOOLEAN DEFAULT true
├── createdAt     TIMESTAMP
└── updatedAt     TIMESTAMP
```

### `flash_sale_products` (junction table)

```sql
flash_sale_products
├── id            SERIAL PRIMARY KEY
├── flashSaleID   INTEGER FK → flash_sales.id (CASCADE DELETE)
├── productID     INTEGER FK → products.id (CASCADE DELETE)
├── discountPrice NUMERIC(12,2)          ← the special sale price
├── sortOrder     INTEGER DEFAULT 0
└── createdAt     TIMESTAMP
```

### `featured_products`

```sql
featured_products
├── id            SERIAL PRIMARY KEY
├── productID     INTEGER FK → products.id (CASCADE DELETE)
├── sortOrder     INTEGER DEFAULT 0
└── createdAt     TIMESTAMP
```

### How they relate to the `products` table

The `products` table (`backend/src/product/product.table.ts`) has:
- `featured` (boolean) — a column-level flag
- `flashSaleProducts: many(flashSaleProductTable)` — reverse relation
- `featuredProducts: many(featuredProductTable)` — reverse relation

---

## 1. Flash Sales

A flash sale is a **time-limited promotional event** where specific products are offered at a discounted price for a fixed date range.

### How the Admin Creates a Flash Sale

**Step 1 — Create the sale record**

The admin navigates to **Ecommerce → Flash Sale** (`/ecom/flash-sale/`) and fills in:

- **Name** — e.g. "Summer Mega Sale"
- **Start Date** — when the sale begins
- **End Date** — when the sale ends
- **Is Active** — toggle to enable/disable

This hits `POST /api/ecom/flash-sale/create`.

**Step 2 — Assign products to the sale**

The admin navigates to **Ecommerce → Flash Products** (`/ecom/flash-products/`) and:

1. Selects a flash sale from a dropdown
2. Picks a product from a searchable selector
3. Sets a **Discount Price** — the special sale price (auto-fills from the product's regular `salePrice`)
4. Sets a **Sort Order** — for display ordering

This hits `POST /api/ecom/flash-sale/add-product`.

### How It's Stored

Two tables work together:

```
flash_sales              flash_sale_products           products
┌──────────────┐        ┌──────────────────────┐      ┌────────────┐
│ id: 1        │──1:M──│ flashSaleID: 1       │──M:1─│ id: 101    │
│ name: "..."  │        │ productID: 101       │      │ name: "..."│
│ startDate    │        │ discountPrice: 29.99 │      │ salePrice  │
│ endDate      │        │ sortOrder: 0         │      │ stock: 50  │
│ isActive: T  │        └──────────────────────┘      └────────────┘
└──────────────┘
```

- One flash sale can have **many products**
- One product can appear in **multiple flash sales** (over different time periods)
- The `discountPrice` on `flash_sale_products` **overrides** the product's regular `salePrice` while the sale is active

### How It's Displayed on the Frontend

1. The homepage calls `GET /api/ecom/flash-sale/active` to find the currently active sale (where `startDate <= now <= endDate`)
2. It calls `GET /api/ecom/flash-products` to get the products in that sale
3. The `FlashProductSlider` component renders a **Swiper carousel** with:
   - A **countdown timer** showing time remaining (HH:MM:SS)
   - Product cards with a **"% OFF" badge** calculated from `(salePrice - discountPrice) / salePrice * 100`
   - Strikethrough original price + discounted price
4. When the countdown expires, the **entire section hides**

### Backend Flow

```
Admin Panel                    Backend                         Database
─────────                    ───────                         ────────
Create Flash Sale     →  ecom.controller.ts            →  flash_sales INSERT
                              ecom.service.ts
                              ecom.repository.ts

Add Product to Sale   →  ecom.controller.ts            →  flash_sale_products INSERT
                              validates sale exists           + Redis cache invalidation
                              ecom.service.ts                 + ISR revalidation trigger
                              ecom.repository.ts
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ecom/flash-sale/create` | Admin | Create a flash sale |
| PUT | `/ecom/flash-sale/update/:id` | Admin | Update a flash sale |
| DELETE | `/ecom/flash-sale/delete/:id` | Admin | Delete a flash sale |
| GET | `/ecom/flash-sale/list` | Admin | List all flash sales (paginated) |
| GET | `/ecom/flash-sale/active` | Public | Get the currently active sale |
| POST | `/ecom/flash-sale/add-product` | Admin | Add product to a sale |
| DELETE | `/ecom/flash-sale/remove-product/:id` | Admin | Remove product from a sale |
| GET | `/ecom/flash-sale/products/:id` | Admin | List products in a specific sale |
| GET | `/ecom/flash-products` | Public | Get active sale products (for homepage) |

---

## 2. Featured Products

Featured products are a **curated selection** of products the admin highlights on the homepage — best sellers, new arrivals, or promotional items.

### How the Admin Creates Featured Products

The admin navigates to **Ecommerce → Featured Products** (`/ecom/featured-products/`) and:

1. Selects a product from a searchable selector (already-featured products are filtered out)
2. Clicks a **toggle** to add/remove featured status

This hits `GET /api/ecom/featured-product/toggle/:productID`.

### How It's Stored

```
featured_products              products
┌──────────────────────┐      ┌────────────┐
│ id: 1                │──M:1─│ id: 101    │
│ productID: 101       │      │ name: "..."│
│ sortOrder: 0         │      │ salePrice  │
│ createdAt: ...       │      │ stock: 50  │
└──────────────────────┘      └────────────┘
```

- Each row links **one product** to the featured list
- Duplicate product entries are prevented by the service layer
- `sortOrder` controls display order on the homepage

### How It's Displayed on the Frontend

1. The homepage calls `GET /api/ecom/featured` to get all active featured products
2. The `FeaturedProducts` component renders a **responsive grid** (2-5 columns) with:
   - A **yellow star icon** header with "Featured Products" text
   - `ProductCard` components for each item
   - A "See All Featured Products" link → `/products?featured=true`
3. Returns nothing if no featured products exist

### Backend Flow

```
Admin Panel                    Backend                         Database
─────────                    ───────                         ────────
Toggle Featured        →  ecom.controller.ts            →  featured_products INSERT/DELETE
                              validates no duplicates         + Redis cache invalidation
                              ecom.service.ts                 + ISR revalidation trigger
                              ecom.repository.ts
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ecom/featured-product/add` | Admin | Add product to featured |
| DELETE | `/ecom/featured-product/remove/:id` | Admin | Remove from featured |
| GET | `/ecom/featured-product/toggle/:productID` | Admin | Toggle featured status |
| GET | `/ecom/featured-product/list` | Admin | List featured products (paginated) |
| GET | `/ecom/featured-product/active` | Public | Get all active featured products |
| GET | `/ecom/featured` | Public | Featured products for homepage |

---

## 3. Offer Products

Offer products are **not a separate entity** — they are the general published product catalog filtered and sorted to highlight the best-selling items. Any product in an active flash sale will also show its `discountPrice` in this list.

### How the Admin Creates Offer Products

**There is no dedicated admin page for offer products.** Offer products are automatically derived from:

- Products that are **published** (`isPublished: true`)
- Products that are **in stock** (`stock > 0`)
- Sorted by **best-selling** (default)

The admin "creates" offer products simply by:
1. Publishing products in the product management section
2. Ensuring they have stock
3. The system automatically includes them in the offers section

### How It's Stored

No separate table. The query runs against the `products` table with a **left join** to `flash_sale_products`:

```sql
SELECT products.*, flash_sale_products.discountPrice
FROM products
LEFT JOIN flash_sale_products ON products.id = flash_sale_products.productID
WHERE products.isPublished = true
  AND products.stock > 0
ORDER BY products.totalSold DESC
```

### How It's Displayed on the Frontend

1. The homepage calls `GET /api/ecom/offers?limit=10&sort=bestSelling`
2. The `OfferProducts` component renders a **responsive grid** with:
   - A **starburst "%" badge** logo with "Offers" text
   - `ProductCard` components — if a product is in an active flash sale, the `discountPrice` is shown with the "% OFF" badge
   - A "See All Offer Products" link → `/products?sort=bestSelling`
3. Shows "No offer products available" message when empty

### Backend Flow

```
Frontend Request               Backend                         Database
───────────────               ───────                         ────────
GET /ecom/offers       →  ecom.controller.ts            →  products SELECT
                              ecom.service.ts                 LEFT JOIN flash_sale_products
                              ecom.repository.ts              WHERE isPublished = true
                              complex query builder           ORDER BY totalSold DESC
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/ecom/offers` | Public | Get offer products (with filters) |

The `/ecom/offers` endpoint supports query parameters:
- `search` — text search on product name
- `category`, `brand`, `unit` — filter by category/brand/unit
- `featured` — filter by featured status
- `minPrice`, `maxPrice` — price range
- `minRating` — minimum rating
- `sort` — `bestSelling`, `priceLow`, `priceHigh`, `rating`, `newest`
- `limit`, `page` — pagination

---

## Cache & Revalidation System

All three sections use a two-layer caching strategy:

### Layer 1: Redis Cache (Backend)

- Flash sales: cached under `ecom:flash_sale`
- Featured products: cached under `ecom:featured_products`
- Cache is **invalidated** on any admin mutation (create/update/delete)

### Layer 2: Next.js ISR (Frontend)

| Cache Tag | Used By | Revalidation |
|-----------|---------|-------------|
| `home-flash-products` | Flash sale data | 3600s (1 hour) |
| `home-featured-products` | Featured products | 3600s (1 hour) |
| `home-offer-products` | Offer products | 3600s (1 hour) |

When the admin makes a change, the backend calls a **webhook** to Next.js:

```
Backend Mutation
    ↓
triggerRevalidation(["home-flash-products"])
    ↓
POST /api/revalidate { tag, secret }
    ↓
Next.js revalidateTag() → fresh data on next request
```

This ensures the homepage reflects changes within seconds, not hours.

---

## Admin Workflow Summary

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Ecommerce                                              │
│  ├── Featured Products    → Toggle featured status      │
│  ├── Flash Sale           → Create/edit/delete sales    │
│  └── Flash Products       → Assign products to sales    │
│                                                         │
│  Products                                               │
│  └── (Publish/unpublish, set prices, manage stock)      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step-by-step for each feature:

**Flash Sale:**
1. Create a flash sale (name, date range)
2. Add products with discount prices
3. Frontend automatically shows the active sale with countdown

**Featured Products:**
1. Toggle the featured flag on any product
2. Frontend automatically shows featured products in a grid

**Offer Products:**
1. Just publish products and keep them in stock
2. Best-selling products automatically appear in the offers section

---

## Frontend Display Summary

```
HOMEPAGE (app/(with_footer)/page.tsx)
├── Flash Products Section (Suspense + skeleton)
│   └── FlashProductSlider (Swiper carousel + CountdownTimer)
│       └── ProductCard × N (with "% OFF" badge + discountPrice)
│
├── Featured Products Section (Suspense + skeleton)
│   └── FeaturedProducts (responsive grid)
│       └── ProductCard × N
│
└── Offer Products Section (Suspense + skeleton)
    └── OfferProducts (responsive grid)
        └── ProductCard × N (with "% OFF" badge if in active flash sale)
```

All three sections use the shared `ProductCard` component which handles:
- Discount badge calculation
- Price display (original + discounted)
- Stock status
- Rating display
- Video playback on hover
- Total sold count

---

## Key Files Reference

| Layer | File | Purpose |
|-------|------|---------|
| **DB Schema** | `backend/src/ecom/ecom.table.ts` | Table definitions |
| **Repository** | `backend/src/ecom/ecom.repository.ts` | Database queries |
| **Service** | `backend/src/ecom/ecom.service.ts` | Business logic + Redis |
| **Controller** | `backend/src/ecom/ecom.controller.ts` | HTTP handlers |
| **Routes** | `backend/src/ecom/ecom.route.ts` | API route definitions |
| **Validation** | `backend/src/ecom/ecom.validator.ts` | Zod schemas |
| **Revalidation** | `backend/utils/revalidate.ts` | ISR webhook trigger |
| **Admin - Flash Sale** | `admin/src/pages/Ecommerce/FlashSale.tsx` | Flash sale CRUD |
| **Admin - Flash Product** | `admin/src/pages/Ecommerce/FlashProduct.tsx` | Assign products to sales |
| **Admin - Featured** | `admin/src/pages/Ecommerce/FeatureProduct.tsx` | Toggle featured |
| **Frontend - Homepage** | `ecommerce/app/(with_footer)/page.tsx` | Assembles all sections |
| **Frontend - API calls** | `ecommerce/utils/homeApi.ts` | Server-side data fetching |
| **Frontend - Flash Slider** | `ecommerce/components/Sliders/FlashProductuSlider.tsx` | Flash sale carousel |
| **Frontend - Countdown** | `ecommerce/components/CountdownTimer.tsx` | Live countdown timer |
| **Frontend - Featured** | `ecommerce/components/Sections/FeaturedProducts.tsx` | Featured grid |
| **Frontend - Offers** | `ecommerce/components/Sections/OfferProducts.tsx` | Offers grid |
| **Frontend - Product Card** | `ecommerce/components/Cards/ProductCard.tsx` | Shared card component |
