# Dashboard Summary Table - Implementation Plan

## Overview

This document outlines the plan to create a `dashboard_summary` table for persisting pre-calculated business metrics. The table will store daily aggregates for sales, purchases, returns, expenses, damages, and profit — serving as a reliable source of truth alongside the existing Redis cache.

---

## Current Problems

### 1. No Persistent Storage for Dashboard Data
All dashboard metrics are computed at runtime from Redis. If Redis data is lost or corrupted, there's no way to recover.

### 2. Redis Calculation Inefficiency
- The write side stores daily, weekly, monthly, yearly, and total keys in Redis
- The **read side ignores** monthly/yearly keys and always reads daily keys
- A 12-month query reads 1,460 daily keys instead of 12 monthly keys

### 3. Known Bugs in Redis Report System

| Bug | Location | Impact |
|-----|----------|--------|
| Expense writes to WRONG Redis keys | `ReportServiceRedis.ts:154-184` | Expenses inflate sale totals |
| Purchase delete calls `updateSaleReport` | `purchase.service.ts:207-214` | Deleting purchase reduces sales instead |
| Expense delete has account balance bug | `expense.service.ts:141-151` | Should increaseBalance, not decrease |
| Damage module doesn't write to Redis | `damage.service.ts` | Damaged goods not tracked in reports |
| Expense not included in profit formula | `report.service.ts:124-128` | Profit calculation incomplete |

---

## Proposed Solution: `dashboard_summary` Table

### Table Schema

```sql
CREATE TABLE dashboard_summary (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  
  -- Sale metrics
  total_sale DECIMAL(12,2) DEFAULT 0,
  total_sale_paid DECIMAL(12,2) DEFAULT 0,
  total_sale_due DECIMAL(12,2) DEFAULT 0,
  total_sale_count INTEGER DEFAULT 0,
  total_sale_qty INTEGER DEFAULT 0,
  total_sale_discount DECIMAL(12,2) DEFAULT 0,
  
  -- Purchase metrics
  total_purchase DECIMAL(12,2) DEFAULT 0,
  total_purchase_paid DECIMAL(12,2) DEFAULT 0,
  total_purchase_due DECIMAL(12,2) DEFAULT 0,
  total_purchase_count INTEGER DEFAULT 0,
  total_purchase_qty INTEGER DEFAULT 0,
  total_purchase_discount DECIMAL(12,2) DEFAULT 0,
  
  -- Sale Return metrics
  total_sale_return DECIMAL(12,2) DEFAULT 0,
  total_sale_return_paid DECIMAL(12,2) DEFAULT 0,
  total_sale_return_count INTEGER DEFAULT 0,
  total_sale_return_qty INTEGER DEFAULT 0,
  
  -- Purchase Return metrics
  total_purchase_return DECIMAL(12,2) DEFAULT 0,
  total_purchase_return_paid DECIMAL(12,2) DEFAULT 0,
  total_purchase_return_count INTEGER DEFAULT 0,
  total_purchase_return_qty INTEGER DEFAULT 0,
  
  -- Expense metrics
  total_expense DECIMAL(12,2) DEFAULT 0,
  total_expense_count INTEGER DEFAULT 0,
  
  -- Damage metrics
  total_damage DECIMAL(12,2) DEFAULT 0,
  total_damage_count INTEGER DEFAULT 0,
  total_damage_qty INTEGER DEFAULT 0,
  
  -- Profit (calculated)
  profit DECIMAL(12,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast date range queries
CREATE INDEX idx_dashboard_summary_date ON dashboard_summary(date);
```

---

## Implementation Plan

### Phase 1: Create Table Migration

**File:** `backend/drizzle/0003_create_dashboard_summary.sql`

```sql
CREATE TABLE IF NOT EXISTS dashboard_summary (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_sale DECIMAL(12,2) DEFAULT 0,
  total_sale_paid DECIMAL(12,2) DEFAULT 0,
  total_sale_due DECIMAL(12,2) DEFAULT 0,
  total_sale_count INTEGER DEFAULT 0,
  total_sale_qty INTEGER DEFAULT 0,
  total_sale_discount DECIMAL(12,2) DEFAULT 0,
  total_purchase DECIMAL(12,2) DEFAULT 0,
  total_purchase_paid DECIMAL(12,2) DEFAULT 0,
  total_purchase_due DECIMAL(12,2) DEFAULT 0,
  total_purchase_count INTEGER DEFAULT 0,
  total_purchase_qty INTEGER DEFAULT 0,
  total_purchase_discount DECIMAL(12,2) DEFAULT 0,
  total_sale_return DECIMAL(12,2) DEFAULT 0,
  total_sale_return_paid DECIMAL(12,2) DEFAULT 0,
  total_sale_return_count INTEGER DEFAULT 0,
  total_sale_return_qty INTEGER DEFAULT 0,
  total_purchase_return DECIMAL(12,2) DEFAULT 0,
  total_purchase_return_paid DECIMAL(12,2) DEFAULT 0,
  total_purchase_return_count INTEGER DEFAULT 0,
  total_purchase_return_qty INTEGER DEFAULT 0,
  total_expense DECIMAL(12,2) DEFAULT 0,
  total_expense_count INTEGER DEFAULT 0,
  total_damage DECIMAL(12,2) DEFAULT 0,
  total_damage_count INTEGER DEFAULT 0,
  total_damage_qty INTEGER DEFAULT 0,
  profit DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_summary_date ON dashboard_summary(date);
```

### Phase 2: Create Table Schema File

**File:** `backend/src/dashboard/dashboard.table.ts`

```typescript
import { pgTable, serial, date, decimal, integer, timestamp } from 'drizzle-orm/pg-core';

export const dashboardSummary = pgTable('dashboard_summary', {
  id: serial('id').primaryKey(),
  date: date('date').notNull().unique(),
  
  // Sale
  totalSale: decimal('total_sale', { precision: 12, scale: 2 }).default('0'),
  totalSalePaid: decimal('total_sale_paid', { precision: 12, scale: 2 }).default('0'),
  totalSaleDue: decimal('total_sale_due', { precision: 12, scale: 2 }).default('0'),
  totalSaleCount: integer('total_sale_count').default(0),
  totalSaleQty: integer('total_sale_qty').default(0),
  totalSaleDiscount: decimal('total_sale_discount', { precision: 12, scale: 2 }).default('0'),
  
  // Purchase
  totalPurchase: decimal('total_purchase', { precision: 12, scale: 2 }).default('0'),
  totalPurchasePaid: decimal('total_purchase_paid', { precision: 12, scale: 2 }).default('0'),
  totalPurchaseDue: decimal('total_purchase_due', { precision: 12, scale: 2 }).default('0'),
  totalPurchaseCount: integer('total_purchase_count').default(0),
  totalPurchaseQty: integer('total_purchase_qty').default(0),
  totalPurchaseDiscount: decimal('total_purchase_discount', { precision: 12, scale: 2 }).default('0'),
  
  // Sale Return
  totalSaleReturn: decimal('total_sale_return', { precision: 12, scale: 2 }).default('0'),
  totalSaleReturnPaid: decimal('total_sale_return_paid', { precision: 12, scale: 2 }).default('0'),
  totalSaleReturnCount: integer('total_sale_return_count').default(0),
  totalSaleReturnQty: integer('total_sale_return_qty').default(0),
  
  // Purchase Return
  totalPurchaseReturn: decimal('total_purchase_return', { precision: 12, scale: 2 }).default('0'),
  totalPurchaseReturnPaid: decimal('total_purchase_return_paid', { precision: 12, scale: 2 }).default('0'),
  totalPurchaseReturnCount: integer('total_purchase_return_count').default(0),
  totalPurchaseReturnQty: integer('total_purchase_return_qty').default(0),
  
  // Expense
  totalExpense: decimal('total_expense', { precision: 12, scale: 2 }).default('0'),
  totalExpenseCount: integer('total_expense_count').default(0),
  
  // Damage
  totalDamage: decimal('total_damage', { precision: 12, scale: 2 }).default('0'),
  totalDamageCount: integer('total_damage_count').default(0),
  totalDamageQty: integer('total_damage_qty').default(0),
  
  // Profit
  profit: decimal('profit', { precision: 12, scale: 2 }).default('0'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Phase 3: Create Dashboard Summary Service

**File:** `backend/src/dashboard/dashboard.service.ts`

```typescript
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../drizzle/src/db';
import { dashboardSummary } from './dashboard.table';

export class DashboardSummaryService {
  
  // Upsert: Update if exists for that date, Insert if not
  static async upsert(date: string, data: Partial<typeof dashboardSummary.$inferInsert>) {
    const existing = await db
      .select()
      .from(dashboardSummary)
      .where(eq(dashboardSummary.date, date))
      .limit(1);

    if (existing.length > 0) {
      // UPDATE existing row
      await db
        .update(dashboardSummary)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(dashboardSummary.date, date));
    } else {
      // INSERT new row
      await db.insert(dashboardSummary).values({ date, ...data });
    }
  }

  // Update sale metrics for a given date
  static async updateSale(date: string, amount: number, paid: number, due: number, qty: number, discount: number) {
    const existing = await this.getOrCreate(date);
    
    await db
      .update(dashboardSummary)
      .set({
        totalSale: String(Number(existing.totalSale) + amount),
        totalSalePaid: String(Number(existing.totalSalePaid) + paid),
        totalSaleDue: String(Number(existing.totalSaleDue) + due),
        totalSaleCount: (existing.totalSaleCount || 0) + 1,
        totalSaleQty: (existing.totalSaleQty || 0) + qty,
        totalSaleDiscount: String(Number(existing.totalSaleDiscount) + discount),
        updatedAt: new Date(),
      })
      .where(eq(dashboardSummary.date, date));
  }

  // Similar methods for purchase, sale_return, purchase_return, expense, damage...

  static async getOrCreate(date: string) {
    const existing = await db
      .select()
      .from(dashboardSummary)
      .where(eq(dashboardSummary.date, date))
      .limit(1);

    if (existing.length > 0) return existing[0];

    // Create new row with defaults
    const newRow = {
      date,
      totalSale: '0',
      totalSalePaid: '0',
      totalSaleDue: '0',
      totalSaleCount: 0,
      totalSaleQty: 0,
      totalSaleDiscount: '0',
      totalPurchase: '0',
      totalPurchasePaid: '0',
      totalPurchaseDue: '0',
      totalPurchaseCount: 0,
      totalPurchaseQty: 0,
      totalPurchaseDiscount: '0',
      totalSaleReturn: '0',
      totalSaleReturnPaid: '0',
      totalSaleReturnCount: 0,
      totalSaleReturnQty: 0,
      totalPurchaseReturn: '0',
      totalPurchaseReturnPaid: '0',
      totalPurchaseReturnCount: 0,
      totalPurchaseReturnQty: 0,
      totalExpense: '0',
      totalExpenseCount: 0,
      totalDamage: '0',
      totalDamageCount: 0,
      totalDamageQty: 0,
      profit: '0',
    };

    await db.insert(dashboardSummary).values(newRow);
    return newRow;
  }

  // Get summary for date range
  static async getSummary(fromDate: string, toDate: string) {
    const rows = await db
      .select()
      .from(dashboardSummary)
      .where(
        and(
          gte(dashboardSummary.date, fromDate),
          lte(dashboardSummary.date, toDate)
        )
      );

    // Aggregate all rows
    const summary = rows.reduce(
      (acc, row) => ({
        totalSale: acc.totalSale + Number(row.totalSale),
        totalSalePaid: acc.totalSalePaid + Number(row.totalSalePaid),
        totalSaleDue: acc.totalSaleDue + Number(row.totalSaleDue),
        totalSaleCount: acc.totalSaleCount + (row.totalSaleCount || 0),
        totalPurchase: acc.totalPurchase + Number(row.totalPurchase),
        totalPurchasePaid: acc.totalPurchasePaid + Number(row.totalPurchasePaid),
        totalPurchaseDue: acc.totalPurchaseDue + Number(row.totalPurchaseDue),
        totalPurchaseCount: acc.totalPurchaseCount + (row.totalPurchaseCount || 0),
        totalSaleReturn: acc.totalSaleReturn + Number(row.totalSaleReturn),
        totalSaleReturnPaid: acc.totalSaleReturnPaid + Number(row.totalSaleReturnPaid),
        totalPurchaseReturn: acc.totalPurchaseReturn + Number(row.totalPurchaseReturn),
        totalPurchaseReturnPaid: acc.totalPurchaseReturnPaid + Number(row.totalPurchaseReturnPaid),
        totalExpense: acc.totalExpense + Number(row.totalExpense),
        totalDamage: acc.totalDamage + Number(row.totalDamage),
      }),
      {
        totalSale: 0,
        totalSalePaid: 0,
        totalSaleDue: 0,
        totalSaleCount: 0,
        totalPurchase: 0,
        totalPurchasePaid: 0,
        totalPurchaseDue: 0,
        totalPurchaseCount: 0,
        totalSaleReturn: 0,
        totalSaleReturnPaid: 0,
        totalPurchaseReturn: 0,
        totalPurchaseReturnPaid: 0,
        totalExpense: 0,
        totalDamage: 0,
      }
    );

    // Calculate profit
    summary['profit'] =
      summary.totalSalePaid -
      summary.totalPurchasePaid -
      summary.totalSaleReturnPaid +
      summary.totalPurchaseReturnPaid -
      summary.totalExpense -
      summary.totalDamage;

    return summary;
  }

  // Get daily breakdown for charts
  static async getDailyBreakdown(fromDate: string, toDate: string) {
    return await db
      .select()
      .from(dashboardSummary)
      .where(
        and(
          gte(dashboardSummary.date, fromDate),
          lte(dashboardSummary.date, toDate)
        )
      )
      .orderBy(dashboardSummary.date);
  }
}
```

### Phase 4: Wire Module Services to Dashboard Summary

Each module service will call `DashboardSummaryService` in addition to `RedisReportService`.

**Example: Sale Service**

```typescript
// In sale.service.ts, after creating a sale:
await DashboardSummaryService.updateSale(
  saleDate,
  sale.totalAmount,
  sale.paidAmount,
  sale.dueAmount,
  totalQty,
  sale.discount || 0
);
```

**Modules to wire:**

| Module | Method | DashboardSummary Call |
|--------|--------|----------------------|
| Sale | create | `updateSale(date, amount, paid, due, qty, discount)` |
| Sale | delete | `updateSale(date, -amount, -paid, -due, -qty, -discount)` |
| Sale | restore | `updateSale(date, amount, paid, due, qty, discount)` |
| Purchase | create | `updatePurchase(date, amount, paid, due, qty, discount)` |
| Purchase | delete | `updatePurchase(date, -amount, -paid, -due, -qty, -discount)` |
| Purchase | restore | `updatePurchase(date, amount, paid, due, qty, discount)` |
| Sale Return | create | `updateSaleReturn(date, amount, paid, qty)` |
| Sale Return | delete | `updateSaleReturn(date, -amount, -paid, -qty)` |
| Sale Return | restore | `updateSaleReturn(date, amount, paid, qty)` |
| Purchase Return | create | `updatePurchaseReturn(date, amount, paid, qty)` |
| Purchase Return | delete | `updatePurchaseReturn(date, -amount, -paid, -qty)` |
| Purchase Return | restore | `updatePurchaseReturn(date, amount, paid, qty)` |
| Expense | create | `updateExpense(date, amount)` |
| Expense | delete | `updateExpense(date, -amount)` |
| Damage | create | `updateDamage(date, lossAmount, qty)` |
| Damage | delete | `updateDamage(date, -lossAmount, -qty)` |

### Phase 5: Update Report Service to Use Dashboard Summary

**File:** `backend/src/report/report.service.ts`

Replace the Redis-heavy read logic with a simple DB query:

```typescript
static async dashboardReport(query: DashboardQuery) {
  const fromDate = query.fromDate || startOfMonth(new Date());
  const toDate = query.toDate || endOfMonth(new Date());

  // Get summary from dashboard_summary table (single SQL query)
  const summary = await DashboardSummaryService.getSummary(fromDate, toDate);

  // Get daily breakdown for charts
  const dailyData = await DashboardSummaryService.getDailyBreakdown(fromDate, toDate);

  // Build response
  return {
    cards: {
      totalSale: summary.totalSale,
      totalPurchase: summary.totalPurchase,
      totalSaleReturn: summary.totalSaleReturn,
      totalPurchaseReturn: summary.totalPurchaseReturn,
      totalExpense: summary.totalExpense,
      totalDamage: summary.totalDamage,
      profit: summary.profit,
    },
    overview: [
      { label: 'Total Sale', value: summary.totalSale, count: summary.totalSaleCount },
      { label: 'Total Purchase', value: summary.totalPurchase, count: summary.totalPurchaseCount },
      { label: 'Sale Return', value: summary.totalSaleReturn, count: summary.totalSaleReturnCount },
      { label: 'Purchase Return', value: summary.totalPurchaseReturn, count: summary.totalPurchaseReturnCount },
      { label: 'Expense', value: summary.totalExpense, count: summary.totalExpenseCount },
      { label: 'Damage', value: summary.totalDamage, count: summary.totalDamageCount },
      { label: 'Profit/Loss', value: summary.profit, count: null },
    ],
    charts: {
      dates: dailyData.map(d => d.date),
      sale: dailyData.map(d => Number(d.totalSalePaid)),
      purchase: dailyData.map(d => Number(d.totalPurchasePaid)),
      profit: dailyData.map(d => Number(d.profit)),
    },
  };
}
```

### Phase 6: Fix Existing Bugs

| Bug | Fix |
|-----|-----|
| Expense writes to `report:sale:*` keys | Change to `report:expense:*` in `ReportServiceRedis.ts:154-184` |
| Purchase delete calls `updateSaleReport` | Change to `updatePurchaseReport` in `purchase.service.ts:207-214` |
| Expense delete calls `decreaseBalance` | Change to `increaseBalance` in `expense.service.ts:141-151` |
| Sale return delete uses `new Date()` | Use original `saleReturn.date` in `sale_return.service.ts:348` |
| Purchase return delete uses `new Date()` | Use original `purchaseReturn.date` in `purchase_return.service.ts:317,417` |

---

## Data Flow Diagram

```
                        WRITE PATH (Dual Write)
                        ======================
  Sale Service ─────┐
  Purchase Service ──┤
  Sale Return Svc ───┤──▶  RedisReportService  ──▶  Redis Hash Maps
  Purchase Ret Svc ──┤     (fast cache)              (daily/weekly/monthly/yearly)
  Expense Service ───┤
  Damage Service ────┘
       │
       └──────────────▶  DashboardSummaryService  ──▶  PostgreSQL Table
                          (source of truth)            (dashboard_summary)

                        READ PATH
                        =========
  Admin Dashboard ──▶  GET /report/dashboard
                           │
                           ├──▶  DashboardSummaryService.getSummary()  ──▶  PostgreSQL
                           │    (single SQL query, ~5-20ms)
                           │
                           └──▶  Response: { cards, overview, charts }
```

---

## Performance Comparison

| Metric | Current (Redis Only) | Proposed (DB + Redis) |
|--------|----------------------|----------------------|
| 30-day query | 120 Redis commands, ~50-200ms | 1 SQL query, ~5-20ms |
| 12-month query | 1,460 Redis commands, ~500ms-1s | 1 SQL query, ~10-30ms |
| Data persistence | ❌ None | ✅ Full |
| Data auditability | ❌ None | ✅ Full |
| Recovery from corruption | ❌ Manual rebuild | ✅ DB is source of truth |
| Write overhead | 1 Redis pipeline | 1 Redis + 1 DB write |

---

## Migration Strategy

### Step 1: Create table and service (no breaking changes)
- Create migration file
- Create `dashboard.table.ts` schema
- Create `dashboard.service.ts` service
- Add barrel export in `drizzle/src/db/schema.ts`

### Step 2: Wire module services (dual write)
- Update sale, purchase, sale_return, purchase_return, expense, damage services
- Both Redis AND DB get updated on every transaction

### Step 3: Update report service (switch read path)
- Change `report.service.ts` to read from `dashboard_summary` instead of Redis
- Keep Redis writes for backward compatibility / fast cache

### Step 4: Fix bugs
- Fix all identified bugs in Phase 6

### Step 5: Add data backfill script
- Script to populate `dashboard_summary` from historical data
- Useful for existing installations

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `backend/drizzle/0003_create_dashboard_summary.sql` | Migration |
| `backend/src/dashboard/dashboard.table.ts` | Table schema |
| `backend/src/dashboard/dashboard.service.ts` | Service layer |
| `backend/src/dashboard/dashboard.controller.ts` | API endpoints (optional) |
| `backend/src/dashboard/dashboard.route.ts` | Routes (optional) |

### Modified Files
| File | Change |
|------|--------|
| `backend/drizzle/src/db/schema.ts` | Add dashboardSummary export |
| `backend/src/sale/sale.service.ts` | Add DashboardSummaryService calls |
| `backend/src/purchase/purchase.service.ts` | Add DashboardSummaryService calls + fix delete bug |
| `backend/src/sale_return/sale_return.service.ts` | Add DashboardSummaryService calls |
| `backend/src/purchase_return/purchase_return.service.ts` | Add DashboardSummaryService calls |
| `backend/src/expense/expense.service.ts` | Add DashboardSummaryService calls + fix delete bug |
| `backend/src/damage/damage.service.ts` | Add DashboardSummaryService calls |
| `backend/src/report/report.service.ts` | Switch to DB read path |
| `backend/utils/ReportServiceRedis.ts` | Fix expense key bug |

---

## Notes

- Redis can still be used as a fast cache for real-time dashboard updates
- The `dashboard_summary` table is the **source of truth**
- If Redis and DB disagree, trust the DB
- Consider adding a nightly reconciliation job to detect discrepancies
- The profit formula now includes expenses and damages:
  ```
  profit = salePaid - purchasePaid - saleReturnPaid + purchaseReturnPaid - expense - damage
  ```

---

## Status

- [ ] Phase 1: Create migration
- [ ] Phase 2: Create table schema
- [ ] Phase 3: Create service
- [ ] Phase 4: Wire module services
- [ ] Phase 5: Update report service
- [ ] Phase 6: Fix bugs
- [ ] Phase 7: Data backfill script
- [ ] Phase 8: Testing
