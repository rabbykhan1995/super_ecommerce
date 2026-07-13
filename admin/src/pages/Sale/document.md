# Sale Module - Admin Frontend Documentation

This document covers the two sale screens in the admin dashboard: **New Sale** (batch-based) and **FIFO Sale** (auto-allocation).

---

## New Sale (`/sale/new`)

A full-featured sale screen supporting all product types: non-stock, batch-tracked, and warranty/serial-tracked products.

**Route:** `/sale/new`  
**Component:** `NewSale.tsx`  
**Backend Endpoint:** `POST /sale/create`

### Core Workflow

```
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ Step 1: Customer      │ -> │ Step 2: Product       │ -> │ Step 3: Cart &        │
│ Selection             │    │ Selection             │    │ Calculation           │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
                                                                  |
                                                                  v
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ Invoice & Redirect    │ <- │ Validation & Submit   │ <- │ Payment & Accounts    │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

### Components

#### 1. Customer Selection
- Dropdown search with 400ms debounce
- Shows customer name + current balance
- Balance indicators:
  - **Red** = Due (negative balance)
  - **Green** = Advance (positive balance)
- Optional — walk-in customers allowed

#### 2. Product Selection
Two input methods: **Search Dropdown** or **Barcode Scanner**.

Product type determines behavior:

| Type | Behavior |
|------|----------|
| **Non-stock** (`manageStock=false`) | Increments quantity on same row |
| **Warranty/Serial** (`manageWarranty=true`) | Fetches serials from backend, allows multi-serial selection, splits rows on mixed batches |
| **Batch-tracked** (`manageStock=true, manageWarranty=false`) | Auto-selects first batch, allows batch switching with row split |

**Sale Price Source:** Variant-level `salePrice` from `VariantListItem` (not product-level).

#### 3. Selected Products Table
Each row supports live editing:

| Column | Editable | Notes |
|--------|----------|-------|
| Name | No | Display only |
| Warranty | Yes | Days input (warranty products only) |
| Serials | Yes | Multi-select dropdown (warranty products only) |
| Batches | Yes | Single-select dropdown (batch products only) |
| Purchase Price | Yes | Can override |
| Sale Price | Yes | Can override |
| Qty | Yes | IncrDecrButton or manual input |
| Total | No | Auto-calculated: `salePrice * soldQty` |

**Row Split Logic:**
- Warranty: Selecting serials from different purchase batches splits the row
- Batch: Changing batch on qty > 1 splits the row

#### 4. Summary & Payment Panel

- **Discount Sync:** Percentage and amount fields sync bidirectionally
- **Other Cost:** Optional additional charges (transport, etc.)
- **Advance Balance:** Auto-deducts customer's advance from payable
- **Split Payment:** Multiple payment methods supported via `PaymentByAccounts`
- **Exchange:** Handles overpayment with automatic exchange toggle
- **Live Balance Preview:** Shows customer's due/advance after sale

#### 5. Validation & Submit

Three validations before submission:
1. At least one product in cart
2. All warranty products must have serials selected
3. Walk-in customers must pay full amount (no due allowed)

**Payload Structure:**
```json
{
  "products": [
    {
      "productID": 1,
      "variantID": 2,
      "batchID": 3,
      "soldQty": 1,
      "salePrice": 500,
      "warranty": 365
    }
  ],
  "accounts": [{ "accountID": 1, "amount": 1000 }],
  "exchangeAccounts": [],
  "sale": {
    "contactID": 5,
    "paid": 1000,
    "costName": "Transport",
    "otherCost": 50,
    "totalProductPrice": 1000,
    "exchangeAmount": 0,
    "discount": 0,
    "totalAmount": 1050,
    "note": "Urgent delivery",
    "saleDate": "2026-07-13",
    "balanceBefore": 200,
    "balanceAfter": -850
  }
}
```

### Scenarios

**Simple Sale (Customer John):**
John buys 5 pens (no stock tracking). Select customer -> search product -> qty 5 -> Sale -> Done.

**Complex Sale (Corporate Client XYZ):**
XYZ buys 2 laptops with different serials from different purchase batches. System creates 2 rows. Client pays 40% cash, 60% bank transfer using split payment.

**Prepaid Customer (Rabi):**
Rabi has 2000 advance. Buys 3000 worth of goods. System auto-deducts 2000, shows payable 1000. Rabi pays 1000 cash, balance becomes 0.

---

## FIFO Sale (`/sale/fifo`)

A simplified POS-style sale screen for fast checkout. Uses FIFO (First-In-First-Out) batch allocation automatically — no manual batch/serial selection.

**Route:** `/sale/fifo`  
**Component:** `FifoSale.tsx`  
**Backend Endpoint:** `POST /sale/create-fifo-sale`

### Core Workflow

```
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ Step 1: Customer      │ -> │ Step 2: Product       │ -> │ Step 3: Cart &        │
│ Selection             │    │ Selection (POS Grid)  │    │ Calculation           │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
                                                                  |
                                                                  v
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ Invoice Modal         │ <- │ Validation & Submit   │ <- │ Payment & Accounts    │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

### Components

#### 1. POS Product Grid (Left Panel)
- Displays `inPosList` products as a visual grid with thumbnails
- Click to add directly to cart
- Fetches from `GET /product/getPosProducts`

#### 2. Product Selection (Center Top)
Two input methods: **Search Dropdown** or **Barcode Scanner**.

Product type behavior:

| Type | Behavior |
|------|----------|
| **Non-stock** (`manageStock=false`) | Increments quantity on same row |
| **Warranty/Serial** (`manageWarranty=true`) | **Blocked** — shows "Please choose a different sale method" |
| **Batch-tracked** (`manageStock=true, manageWarranty=false`) | Increments quantity, checks stock availability |

**Note:** Warranty/serial products are not supported in FIFO sale. Use New Sale for those.

#### 3. Selected Products Table (Center)
Simpler than New Sale — no batch/serial columns.

| Column | Editable | Notes |
|--------|----------|-------|
| Name | No | Shows name + stock count |
| Price | Yes | Sale price override |
| Qty | Yes | IncrDecrButton with stock limit |
| Total | No | Auto-calculated |
| Action | — | Delete button (Trash icon) |

#### 4. Summary & Payment Panel (Right)
Same as New Sale: discount sync, other cost, advance balance, split payment, exchange, live balance preview.

#### 5. Invoice Modal
After successful sale, an invoice modal pops up for printing:
- Supports 58mm and 80mm print sizes
- Can be closed and re-opened from sale list

### Validation & Submit

Two validations before submission:
1. At least one product in cart
2. Walk-in customers must pay full amount

**Payload Structure:**
```json
{
  "products": [
    {
      "productID": 1,
      "soldQty": 1,
      "salePrice": 500
    }
  ],
  "accounts": [{ "accountID": 1, "amount": 500 }],
  "exchangeAccounts": [],
  "sale": {
    "contactID": null,
    "paid": 500,
    "costName": null,
    "otherCost": 0,
    "totalProductPrice": 500,
    "exchangeAmount": 0,
    "discount": 0,
    "totalAmount": 500,
    "note": null,
    "saleDate": "2026-07-13",
    "balanceBefore": 0,
    "balanceAfter": 0
  }
}
```

**Key Difference from New Sale:** No `batchID`, `variantID`, or `warranty` in products — the backend auto-allocates FIFO batches.

### Scenarios

**Quick POS Sale:**
Customer buys a pen from the POS grid. Click product -> enter quantity -> pay full amount -> Sale -> Invoice modal pops up -> Print.

**Barcode Scan Sale:**
Customer brings 3 items. Scan barcode 3 times (each increments qty or adds new row). Select customer -> Sale.

---

## Key Differences: New Sale vs FIFO Sale

| Feature | New Sale | FIFO Sale |
|---------|----------|-----------|
| Batch selection | Manual (dropdown) | Auto (FIFO) |
| Serial/Warranty | Full support | Blocked |
| Row split | Yes (batch/serial change) | No |
| Purchase price display | Yes | No |
| POS grid | No | Yes (left panel) |
| Invoice after sale | Redirect to page | Modal popup |
| Print sizes | N/A | 58mm / 80mm |
| Product type support | All 3 types | Non-stock + Batch only |

---

## File Structure

```
admin/src/pages/Sale/
  NewSale.tsx          # Batch-based sale (full-featured)
  FifoSale.tsx         # FIFO auto-allocation sale (POS-style)
  SaleList.tsx         # Sale history list
  SaleInvoice.tsx      # Invoice print page
  EditSale.tsx         # Edit sale (placeholder)
  document.md          # This file

admin/src/types/type.ts
  SaleProduct          # Type for NewSale selected products
  PosSaleProduct       # Type for FifoSale selected products
  VariantListItem      # Type for product dropdown options

admin/src/validators/sale.validator.ts
  createSaleSchema     # Zod validation for New Sale
  createfifoSaleSchema # Zod validation for FIFO Sale

admin/src/components/Ui/PaymentOption.tsx
  PaymentByAccounts    # Split payment component

admin/src/components/buttons/IncrDecrButton.tsx
  IncrDecrButton       # Quantity increment/decrement button

admin/src/components/modals/SaleInvoiceModal.tsx
  SaleInvoiceModal     # Post-sale invoice modal (FIFO)
```
