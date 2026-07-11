# Purchase Generation - Business Documentation

## Overview

A purchase is generated when three core components are successfully processed and validated within a single PostgreSQL transaction:

1. **Product** — inventory items being bought from a supplier
2. **Payment** — money paid to the supplier
3. **Purchase Data** — the financial record linking everything together

All three must be present and valid for a purchase to complete. On failure, the entire transaction rolls back.

---

## Core Components

### 1. Product

Represents the items being purchased from a supplier.

**Requirements:**
- Product must exist in the system (referenced by `productID`)
- Variant must exist (referenced by `variantID`)
- Quantity must be >= 1
- Purchase price and sale price must be > 0

**Process:**
- For each product in the request, create a new batch record
- Each batch captures: cost, purchasedQty, remainingQty, serial (if tracked), expireDate (if perishable)
- Create stock flow record (type: `in`, referenceType: `purchase`)
- Increase product and variant stock by `purchasedQty`

### 2. Payment

Handles how the business pays the supplier.

**Payment types:**
- **Payment to supplier** (`paid > 0`): Money sent from one or more accounts
- **Change received** (`exchangeAmount > 0`): Money received back from supplier
- Both can occur in the same purchase

**Requirements:**
- At least one account must be specified in `accounts` or `exchangeAccounts`
- Amounts must be >= 0

**Process:**
- If `paid > 0`: Decrease account balances (`AccountService.decreaseBalance`), create debit transactions
- If `exchangeAmount > 0`: Increase account balances (`AccountService.increaseBalance`), create credit transactions
- All transactions are linked to the purchase via `source: "purchase"`

### 3. Purchase Data

The financial record of the transaction.

**Includes:**
- `totalAmount` — final amount owed to supplier
- `paid` — amount paid in this purchase
- `discount` — discount received from supplier
- `exchangeAmount` — change received back
- `balanceBefore` / `balanceAfter` — supplier due/advance snapshot
- `deletable` — whether this purchase can be deleted later
- `invoiceNo` — auto-generated (starts at 100001, increments by 1)

---

## Purchase Workflow

1. User selects product(s) with quantities, purchase prices, and sale prices
2. System validates the supplier exists
3. System computes supplier balance before/after
4. All operations execute inside a single PostgreSQL transaction:
   - Purchase record created
   - Batch records created per product (with stock, cost, serial, expiry)
   - Stock flows recorded (type: `in`)
   - Product and variant stock increased
   - Account balances updated (payment out, exchange in)
   - Transactions created for audit trail
   - Supplier balance updated
   - Ledger entry created
5. Redis report cache updated with purchase totals
6. Purchase is returned to the client

---

## Batch Creation

Each product in a purchase creates a new **batch** record. Batches are the core inventory tracking unit:

| Field | Purpose |
|-------|---------|
| `cost` | Purchase price per unit (used for FIFO cost calculation in sales) |
| `purchasedQty` | Original quantity bought |
| `remainingQty` | Current stock (decreased by sales, increased by returns) |
| `serial` | Serial number for warranty-tracked products |
| `expireDate` | Expiry date for perishable items |
| `purchaseID` | Links back to the originating purchase |
| `isActive` | Whether the batch is still in use |

Batches enable:
- **FIFO sales** — oldest batches are sold first
- **Warranty tracking** — serial-linked batches track product lifecycle
- **Expiry management** — perishable items can be tracked by batch
- **Stock flow audit** — every stock change is recorded per batch

---

## Failure Scenarios

| Scenario | Action |
|----------|--------|
| Supplier not found | 404 Error, transaction rolled back |
| Batch creation failed | 400 Error, transaction rolled back |
| Any DB error mid-transaction | Full rollback via `withTransaction` |

---

## Final Condition for Purchase Generation

A purchase is successfully generated only if:

- The supplier exists and is valid
- All products and variants exist
- Batch records are created successfully for every product
- The PostgreSQL transaction commits successfully
- Redis report cache is updated

---

## Delete Purchase Flow

Deletion reverses all effects of the original purchase:

1. **Restore stock** — decrease batch, product, and variant stock for each batch
2. **Reverse payments** — increase account balances for debit transactions
3. **Reverse exchange** — decrease account balances for credit transactions
4. **Rollback supplier balance** — restore `balanceBefore` by applying the inverse
5. **Delete purchase record** — cascades to delete batches
6. **Update Redis report** — subtract purchase totals from cached report

**Blocked when:** `deletable === false` (typically when items from this purchase have been returned via `purchase_return` or sold via sale)

---

## Purchase vs Sale - Key Differences

| Aspect | Purchase | Sale |
|--------|----------|------|
| Direction | Incoming inventory | Outgoing inventory |
| Contact | Supplier (required) | Customer (optional) |
| Batch behavior | Creates new batches | Uses existing batches |
| Payment flow | Money goes out (debit) | Money comes in (credit) |
| Exchange flow | Change received (credit) | Change given (debit) |
| Stock effect | Increases stock | Decreases stock |
| FIFO support | N/A (creates batches) | Allocates from oldest batches |
| Warranty | Creates batch with serial | Creates warranty record |

---

## Notes

- All monetary calculations use `numeric(12, 2)` for precision
- The `invoice_no` is auto-generated by a PostgreSQL sequence, not a model counter
- Unlike sales, purchases always require a supplier (`supplierID` is NOT NULL)
- Exchange handling is nested inside the payment block in the code — exchange is only processed if a payment occurred
- The legacy `purchaseCounter.model.ts` file still exists but is no longer used (replaced by PostgreSQL sequence)
