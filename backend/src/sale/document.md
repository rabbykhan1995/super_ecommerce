# Sale Module Documentation

## Overview

The Sale module records outgoing inventory (products sold to customers), handles payments into accounts, updates customer due/advance balances, manages FIFO batch stock, and optionally creates warranty records for serialized products.

**Base route:** `/sale`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sale/create` | Create a new sale |
| GET | `/sale/list` | Paginated sale list |
| GET | `/sale/saleByID/:id` | Sale invoice details |
| DELETE | `/sale/delete/:id` | Delete a sale (if `deletable`) |

> **Note:** `SaleService.posFifoSale()` exists for POS-style FIFO sales (no batch selection, no warranty products) but is not yet wired to a route.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `sale.route.ts` | Express routes + validation |
| `sale.controller.ts` | HTTP handlers |
| `sale.service.ts` | Business logic (create, delete, list) |
| `sale.repository.ts` | Database queries |
| `sale.model.ts` | Mongoose schema |
| `sale.type.ts` | TypeScript interfaces |
| `sale.validator.ts` | Zod request validation |
| `saleCounter.model.ts` | Auto-increment invoice numbers |

---

## Data Model

### Sale document (`ISale`)

| Field | Type | Description |
|-------|------|-------------|
| `invoiceNo` | string | Auto-generated (`INV-{counter}`) |
| `customerID` | ObjectId? | Contact reference (customer) |
| `products` | array | `{ productID, batchID?, soldQty, salePrice, warranty }` |
| `totalProductPrice` | number | Sum of product line totals |
| `otherCost` | number | Extra charges |
| `discount` | number | Discount applied |
| `totalAmount` | number | `totalProductPrice + otherCost - discount` |
| `paid` | number | Amount customer paid in this sale |
| `exchangeAmount` | number | Change/refund given back to customer |
| `balanceBefore` | number | Customer balance snapshot before sale |
| `balanceAfter` | number | Customer balance snapshot after sale |
| `accounts` | array | `{ accountID, amount }` — payment received into accounts |
| `exchangeAccounts` | array | `{ accountID, amount }` — change paid out from accounts |
| `deletable` | boolean | `false` when warranty is claimed (blocks delete) |
| `SaleDate` | Date | Sale date |

### Request payload (`createSaleSchema`)

```json
{
  "sale": { "contactID", "totalAmount", "paid", "discount", "saleDate", ... },
  "products": [{ "productID", "batchID?", "soldQty", "salePrice", "warranty?" }],
  "accounts": [{ "accountID", "amount" }],
  "exhangeAccounts": [{ "accountID", "amount" }]
}



working flow 


flowchart TD
    A[POST /sale/create] --> B[Validate payload - Zod]
    B --> C{Customer contactID?}
    C -->|Yes| D[Load customer + set balanceBefore/After]
    C -->|No| E[Skip customer balance]
    D --> F[Pre-check stock for each product]
    E --> F
    F --> G{Stock sufficient?}
    G -->|No| H[400 Error]
    G -->|Yes| I[Start MongoDB transaction]
    I --> J[Generate invoiceNo from SaleCounter]
    J --> K[Create Sale document]
    K --> L[For each product with batchID]
    L --> M[Reduce batch remainingQty + soldQty]
    M --> N{Batch empty?}
    N -->|Yes| O[Set isActive=false + advance FIFO pointer]
    N -->|No| P[Update product stock qty]
    O --> P
    P --> Q{manageWarranty + serial?}
    Q -->|Yes| R[Create Warranty record]
    Q -->|No| S[Payment handling]
    R --> S
    S --> T{paid > 0?}
    T -->|Yes| U[increaseBalance on accounts]
    U --> V[Create transactions type=sale toAccount]
    T -->|No| W{exchangeAmount > 0?}
    V --> W
    W -->|Yes| X[decreaseBalance on exchangeAccounts]
    X --> Y[Create transactions type=exchange fromAccount]
    W -->|No| Z{Customer exists?}
    Y --> Z
    Z -->|Yes| AA[Update customer balance + create ledger]
    Z -->|No| AB[Commit transaction]
    AA --> AB
    AB --> AC[Update Redis sale report]
    AC --> AD[Return sale]


Step-by-step
1. Pre-transaction validation
Resolve customer if contactID is set
Compute balanceBefore / balanceAfter
For each product:
Verify product exists
Round qty if product uses decimals
If manageStock: check batch or product-level stock
2. Inside MongoDB transaction
Invoice — increment SaleCounter, assign INV-{n}
Sale record — persist sale with products and accounts
Stock / batch updates (per product with batchID):
Decrement batch.remainingQty, increment batch.soldQty
If batch depleted → isActive = false, find next FIFO batch
Decrement product stock via updateProductFifoBatchAndStock
Warranty — if product has manageWarranty and batch has serial:
Create warranty linked to sale, customer, supplier, batch
Payment (paid > 0):
AccountService.increaseBalance(accounts) — money in
TransactionService.create with type: "sale", accountField: "toAccount"
Exchange (exchangeAmount > 0):
AccountService.decreaseBalance(exchangeAccounts) — change out
TransactionService.create with type: "exchange", accountField: "fromAccount"
Customer ledger (if customer):
ContactService.balanceUpdate(customer, amount)
LedgerService.create with type: "sale"
3. Post-transaction
Update Redis sale report (amount, qty, due, paid, discount)
Account Balance Impact
Event	Account effect	Transaction field
Customer pays (paid)
Increase balance
toAccount
Change given (exchangeAmount)
Decrease balance
fromAccount


Delete Sale Flow
Only allowed when sale.deletable === true.

flowchart TD
    A[DELETE /sale/delete/:id] --> B{Sale exists?}
    B -->|No| C[404 Error]
    B -->|Yes| D{deletable?}
    D -->|No| E[400 Error - warranty claimed]
    D -->|Yes| F[Start transaction]
    F --> G[Restore batch remainingQty + soldQty]
    G --> H[Restore product stock]
    H --> I{accounts.length > 0?}
    I -->|Yes| J[decreaseBalance - reverse payment]
    J --> K[Delete transactions]
    I -->|No| L{exchangeAmount > 0?}
    K --> L
    L -->|Yes| M[increaseBalance - reverse exchange]
    L --> N{customerID?}
    M --> N
    N -->|Yes| O[Rollback customer balance]
    N --> P[Delete warranties by saleID]
    O --> P
    P --> Q[Delete ledger entries]
    Q --> R[Commit + reverse Redis report]

                  ┌───────────────────────┐
                  │      SaleService      │
                  └───────────┬───────────┘
      ┌───────────────────────┼───────────────────────┐
      ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│ContactService │       │ProductService │       │AccountService │
│(Client Profiles)      │(FIFO/Inventory)       │(Cash Flow Checks)
└───────────────┘       └───────────────┘       └───────────────┘
      │                       │                       │
      ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│LedgerService  │       │WarrantyService│       │TxService      │
│(Financial Hist)       │(Serial Tracking)      │(Audit Trails) │
└───────────────┘       └───────────────┘       └───────────────┘
                              │                       │
                              ▼                       ▼
                        ┌───────────────┐       ┌───────────────┐
                        │PurchaseService│       │RedisReportServ│
                        │(Supplier Links)       │(Fast Caching) │
                        └───────────────┘       └───────────────┘


POS FIFO Sale (posFifoSale)
Alternative create path for point-of-sale:

No batchID in request — system auto-picks oldest active FIFO batch
Rejects warranty-managed products
Uses product-level stock check only
Same payment, ledger, and account logic as regular sale
Not exposed via route yet (SaleController.posSale is empty)


Dependencies
Service	Used for
ContactService
Customer lookup + balance update
ProductService
Stock, batch, FIFO updates
AccountService
Account balance increase/decrease
TransactionService
Payment audit trail
LedgerService
Customer financial history
WarrantyService
Serial product warranty records
PurchaseService
Supplier lookup for warranty
RedisReportService
Dashboard/report caching

Key Business Rules
All create/delete operations use MongoDB transactions — partial writes are rolled back on error.
Stock is reduced at batch level when batchID is provided; FIFO pointer advances when a batch is depleted.
deletable becomes false when a warranty on this sale is claimed — delete is blocked.
accounts stores a snapshot of which accounts received payment and how much.
Customer is optional — walk-in sales without contactID skip ledger/balance updates.
