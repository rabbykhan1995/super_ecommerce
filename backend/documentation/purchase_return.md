# Purchase Return - Business Documentation

## Overview

A purchase return is generated when products are sent back to a supplier. It reverses the effects of the original purchase for the returned items: stock is decreased, supplier balance is adjusted, and refund payments are recorded.

A purchase return must reference an existing purchase and validates that the return quantity does not exceed what was originally purchased (minus any previous returns).

---

## Core Components

### 1. Product (Returned Items)

Represents the items being sent back to the supplier.

**Requirements:**
- Must reference an existing purchase (`purchaseID`)
- Each item must reference a valid batch from that purchase
- `purchaseReturnQty` must not exceed `maxReturnable`
- `returnPrice` must be positive

**Max Returnable Calculation:**
```
maxReturnable = batch.purchasedQty - alreadyReturned
```
Where `alreadyReturned` is the sum of previous `out` stock flows for this batch + purchase combination.

**Process:**
- For each returned item, validate batch exists and check returnable quantity
- Decrease batch, product, and variant stock
- Create stock flow record (type: `out`, referenceType: `purchase_return`)
- Create purchase return item with batch cost snapshot

### 2. Payment (Refund)

Handles how the supplier refunds the business.

**Payment types:**
- **Refund received** (`paid > 0`): Money received back from supplier into accounts
- **Change given** (`exchangeAmount > 0`): Money sent back to supplier
- Both can occur in the same return

**Process:**
- If `paid > 0`: Increase account balances (refund received), create credit transactions
- If `exchangeAmount > 0`: Decrease account balances (change given back), create debit transactions

### 3. Purchase Return Data

The financial record of the return transaction.

**Includes:**
- `purchaseID` — link to original purchase
- `supplierID` — the supplier receiving the return
- `totalAmount` — total value of returned items
- `paid` — refund amount received
- `discount` — discount applied
- `exchangeAmount` — change given back
- `balanceBefore` / `balanceAfter` — supplier balance snapshot
- `date` — return date

---

## Purchase Return Workflow

1. User selects the original purchase and products to return
2. User specifies quantities and reasons for each returned item
3. System validates:
   - Original purchase exists
   - Each batch exists and belongs to the purchase
   - Return quantities do not exceed max returnable
4. System computes supplier balance before/after
5. All operations execute inside a single PostgreSQL transaction:
   - Purchase return record created
   - Stock decreased for each returned batch
   - Stock flows recorded (type: `out`, referenceType: `purchase_return`)
   - Return items created with cost snapshots
   - Account balances updated (refund in, exchange out)
   - Transactions created for audit trail
   - Supplier balance updated
   - Ledger entry created
6. Redis report cache updated
7. Purchase return is confirmed

---

## Max Returnable Validation

The system prevents over-returning by tracking previous returns:

```
Original purchase: 10 units of batch #5
First return: 3 units returned
Second return: maxReturnable = 10 - 3 = 7 units
```

This is tracked via stock flows — each return creates an `out` flow for the batch. The system sums all `out` flows linked to the batch + purchase to calculate what's already been returned.

---

## Failure Scenarios

| Scenario | Action |
|----------|--------|
| Purchase not found | 404 Error, transaction rolled back |
| Supplier not found | 404 Error, transaction rolled back |
| Batch not found | 404 Error, transaction rolled back |
| Return qty exceeds max returnable | 400 Error, transaction rolled back |
| Any DB error mid-transaction | Full rollback via `withTransaction` |

---

## Final Condition for Purchase Return Generation

A purchase return is successfully generated only if:

- The original purchase exists
- All referenced batches exist
- Return quantities are within max returnable limits
- The PostgreSQL transaction commits successfully
- Redis report cache is updated

---

## Delete Purchase Return Flow

Deletion reverses all effects of the original purchase return:

1. **Restore stock** — increase batch, product, and variant stock for each returned item
2. **Reverse refund** — decrease account balances for credit transactions
3. **Reverse exchange** — increase account balances for debit transactions
4. **Rollback supplier balance** — restore previous balance
5. **Delete purchase return record** — cascades to delete return items
6. **Update Redis report** — subtract return totals from cached report

Unlike purchases and sales, purchase returns have **no `deletable` flag** — they can always be deleted.

---

## Purchase Return vs Purchase vs Sale

| Aspect | Purchase | Purchase Return | Sale |
|--------|----------|-----------------|------|
| Direction | Incoming inventory | Outgoing (back to supplier) | Outgoing (to customer) |
| Contact | Supplier (required) | Supplier (from purchase) | Customer (optional) |
| Stock effect | Increases stock | Decreases stock | Decreases stock |
| Batch behavior | Creates new batches | Uses existing batches | Uses existing batches |
| Payment flow | Money goes out (debit) | Refund comes in (credit) | Money comes in (credit) |
| Exchange flow | Change received (credit) | Change given (debit) | Change given (debit) |
| Balance effect | Increases supplier balance | Decreases supplier balance | Increases customer balance |
| Deletable check | Yes (`deletable` flag) | No (always deletable) | Yes (`deletable` flag) |
| Return validation | N/A | Max returnable check | N/A |

---

## Notes

- All monetary calculations use `numeric(12, 2)` for precision
- The `purchase_price` in return items is snapshotted from `batch.cost` at return time (not the original purchase price)
- Exchange handling is nested inside the payment block — exchange is only processed if a payment occurred
- The ledger entry links back to the original purchase via `purchaseReturnID`
- Stock flows provide a complete audit trail of all returns per batch per purchase
