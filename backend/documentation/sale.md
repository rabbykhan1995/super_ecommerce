# Sales Generation - Business Documentation

## Overview

A sale is generated when three core components are successfully processed and validated within a single PostgreSQL transaction:

1. **Product** — inventory items being sold
2. **Payment** — money received from the customer
3. **Sale Data** — the financial record linking everything together

All three must be present and valid for a sale to complete. On failure, the entire transaction rolls back.

---

## Core Components

### 1. Product

Represents the items being sold.

**Requirements:**
- Product must exist in the system (verified via `ProductService.findById`)
- Batch must exist if `batchID` is provided (verified via `ProductService.findBatchByIDForSale`)
- Variant must exist (verified via `ProductService.findVariantByID`)
- Sufficient stock must be available (if `product.manageStock = true`)

**Process:**
- For each product in the request, fetch and validate product, batch, and variant
- Check `batch.remainingQty >= soldQty` for stock-managed products
- Decrease batch, product, and variant stock atomically
- Record stock flow (type: `out`, referenceType: `sale`)
- Create a `sale_items` row linking the product to the sale

### 2. Payment

Handles how the customer pays for the sale.

**Payment types:**
- **Cash/bank payment** (`paid > 0`): Money received into one or more accounts
- **Exchange** (`exchangeAmount > 0`): Change/refund given back from accounts
- Both can occur in the same sale

**Requirements:**
- At least one account must be specified in `accounts` or `exchangeAccounts`
- Amounts must be >= 0

**Process:**
- If `paid > 0`: Increase account balances (`AccountService.increaseBalance`), create credit transactions
- If `exchangeAmount > 0`: Decrease exchange account balances (`AccountService.decreaseBalance`), create debit transactions
- All transactions are linked to the sale via `source: "sale"`

### 3. Sale Data

The financial record of the transaction.

**Includes:**
- `totalAmount` — final amount owed by customer
- `paid` — amount paid in this sale
- `discount` — discount applied
- `exchangeAmount` — change given back
- `balanceBefore` / `balanceAfter` — customer due/advance snapshot
- `deletable` — whether this sale can be deleted later
- `invoiceNo` — auto-generated (starts at 100001, increments by 1)

---

## Sales Workflow

1. Customer selects product(s) with quantities and sale prices
2. System validates all products, batches, and variants exist
3. System checks stock availability (for stock-managed products)
4. Customer specifies payment accounts and amounts
5. System computes customer balance before/after
6. All operations execute inside a single PostgreSQL transaction:
   - Sale record created
   - Stock decremented, stock flows recorded
   - Sale items created
   - Warranty records created (if applicable)
   - Account balances updated
   - Transactions created
   - Customer balance updated
   - Ledger entry created
7. Redis report cache updated with sale totals
8. Sale is returned to the client

---

## Two Sale Methods

| Feature | Standard Sale (`/create`) | FIFO Sale (`/create-fifo-sale`) |
|---------|--------------------------|--------------------------------|
| Batch selection | Client specifies `batchID` | System auto-picks oldest batches |
| Warranty products | Supported | Rejected (400 error) |
| Stock check | Batch-level | Variant-level across all batches |
| Allocation | Single batch per item | Multiple batches per item (FIFO) |
| Use case | Detailed batch tracking | Quick POS sales |

---

## Failure Scenarios

| Scenario | Action |
|----------|--------|
| Customer not found | 404 Error, transaction rolled back |
| Product/batch/variant not found | 404 Error, transaction rolled back |
| Insufficient stock | 400 Error, transaction rolled back |
| Warranty product in FIFO sale | 400 Error, transaction rolled back |
| Sale not deletable (warranty claimed) | 400 Error |
| Sale not found | 404 Error |
| Any DB error mid-transaction | Full rollback via `withTransaction` |

---

## Final Condition for Sale Generation

A sale is successfully generated only if:

- All products, batches, and variants exist and are valid
- Stock is sufficient for all stock-managed products
- Payment accounts are valid
- The PostgreSQL transaction commits successfully
- Redis report cache is updated

---

## Delete Sale Flow

Deletion reverses all effects of the original sale:

1. **Restore stock** — increase batch, product, and variant stock for each sold item
2. **Reverse payments** — decrease account balances for credit transactions
3. **Reverse exchange** — increase account balances for debit transactions
4. **Rollback customer balance** — restore `balanceBefore` by applying the inverse of `balanceAfter - balanceBefore`
5. **Delete sale record** — cascades to delete `sale_items`
6. **Update Redis report** — subtract sale totals from cached report

**Blocked when:** `deletable === false` (typically when a warranty on this sale has been claimed)

---

## Notes

- All monetary calculations use `numeric(12, 2)` for precision
- The `invoice_no` is auto-generated by a PostgreSQL sequence, not a model counter
- Walk-in customers (no `customerID`) skip all customer balance and ledger operations
- Warranty creation links the sale to the original purchase via the batch's `purchaseID`
- The `sale_items` table enables per-product tracking within a sale (replaces the old embedded array approach)
