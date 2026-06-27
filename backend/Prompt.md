# Project Architecture & Development Guide

## Stack

* Runtime: Node.js
* Language: TypeScript
* Database: PostgreSQL
* ORM: Drizzle ORM
* Validation: Zod
* Architecture: Repository Pattern

---

# Folder Structure

```
src/
 ├── db/
 │    ├── schema/
 │    ├── relations/
 │    └── db.ts
 │
 ├── modules/
 │    ├── product/
 │    ├── sale/
 │    ├── purchase/
 │    ├── contact/
 │    ├── account/
 │    ├── transaction/
 │    └── ...
 │
 ├── repositories/
 │
 ├── utils/
 │
 └── services/
```

---

# Repository Rules

Every module contains a repository.

Repositories are responsible only for database operations.

Business logic must stay inside services.

Repository methods should never contain business calculations.

Example:

```
ProductRepository.create()
ProductRepository.update()
ProductRepository.findByID()

SaleRepository.create()

PurchaseRepository.list()
```

---

# Query Style

Always use Drizzle ORM.

Never use raw SQL unless absolutely necessary.

Relations should always use

```
db.query.table.findFirst()

db.query.table.findMany()
```

instead of manual joins whenever possible.

Example

```
db.query.productTable.findFirst({
    where: eq(productTable.id,id),
    with:{
        brand:true,
        unit:true,
        category:true
    }
})
```

---

# Pagination

Every listing API must use the shared paginate() helper.

Never create custom pagination logic.

Standard return type

```
interface PaginatedResult<T>{
    items:T[]
    total:number
    page:number
    limit:number
}
```

Usage

```
paginate({
    db,
    query,
    countTable,
    page,
    limit,
    search,
    searchColumns,
    where,
    with
})
```

---

# Numeric Fields

Money fields use

```
numeric({
    precision:12,
    scale:2,
    mode:"number"
})
```

Reason

* accepts JS number
* easier calculations
* no string conversion

---

# IDs

Every table uses

```
id serial primary key
```

Foreign keys are integer.

---

# Invoice Number

Invoice number is NOT UUID.

Invoice number uses PostgreSQL Sequence.

Example

```
sale_invoice_no_seq

100001
100002
100003
...
```

---

# Stock Management

Product stock is maintained separately.

Batch also maintains

```
remainingQty

soldQty

returnedQty
```

Product stock should always equal the sum of active batches.

---

# Batch Policy

FIFO is used.

Oldest purchase batch sells first.

Product stores current fifoBatchID.

---

# Transaction Module

Every money movement creates one transaction.

Transaction contains

```
accountID

amount

type

source
```

Possible sources

```
purchase
purchase_return
sale
sale_return
expense
deposit
withdraw
balance_transfer
warranty
```

Transaction also stores source id

Example

```
purchaseID

saleID

saleReturnID
```

Only one source ID should be populated.

---

# Contact Ledger

Customer/Supplier balance is stored separately.

Transactions affecting contact balance should update the contact ledger.

---

# Database Rules

Always use

```
onDelete:"cascade"
```

where child records must disappear automatically.

Every searchable field should have indexes.

Primary Key

Unique

Foreign Keys

should all be indexed.

---

# Update Rules

Never read-modify-write in memory for counters.

Always update using SQL expressions.

Example

```
stock = stock + qty

remainingQty = remainingQty - qty

soldQty = soldQty + qty
```

---

# Search

Search uses

```
ILIKE
```

through shared pagination helper.

Never duplicate search logic.

---

# Relations

Always define Drizzle relations.

Never manually fetch foreign records if relations already exist.

---

# Naming Convention

Tables

```
productTable
saleTable
batchTable
contactTable
```

Types

```
Product

NewProduct

UpdateProduct

Sale

Batch
```

Repositories

```
ProductRepository

SaleRepository

BatchRepository
```

---

# Coding Style

* Small functions
* Repository only handles DB
* Services handle business logic
* Reusable helpers preferred
* Avoid duplicate code
* Prefer generic helpers

---

# AI Instructions

When generating code for this project:

1. Always use Drizzle ORM.
2. Follow existing repository pattern.
3. Reuse paginate() whenever listing data.
4. Use defined relations instead of manual joins.
5. Keep business logic outside repositories.
6. Use PostgreSQL features whenever possible.
7. Preserve project naming conventions.
8. Generate clean TypeScript only.
9. Avoid unnecessary comments.
10. Match existing coding style.
