import { pgTable, serial, date, decimal, integer, timestamp } from "drizzle-orm/pg-core";

export const dashboardSummaryTable = pgTable("dashboard_summary", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),

  // Sale
  totalSale: decimal("total_sale", { precision: 12, scale: 2 }).default("0"),
  totalSalePaid: decimal("total_sale_paid", { precision: 12, scale: 2 }).default("0"),
  totalSaleDue: decimal("total_sale_due", { precision: 12, scale: 2 }).default("0"),
  totalSaleCount: integer("total_sale_count").default(0),
  totalSaleQty: integer("total_sale_qty").default(0),
  totalSaleDiscount: decimal("total_sale_discount", { precision: 12, scale: 2 }).default("0"),

  // Purchase
  totalPurchase: decimal("total_purchase", { precision: 12, scale: 2 }).default("0"),
  totalPurchasePaid: decimal("total_purchase_paid", { precision: 12, scale: 2 }).default("0"),
  totalPurchaseDue: decimal("total_purchase_due", { precision: 12, scale: 2 }).default("0"),
  totalPurchaseCount: integer("total_purchase_count").default(0),
  totalPurchaseQty: integer("total_purchase_qty").default(0),
  totalPurchaseDiscount: decimal("total_purchase_discount", { precision: 12, scale: 2 }).default("0"),

  // Sale Return
  totalSaleReturn: decimal("total_sale_return", { precision: 12, scale: 2 }).default("0"),
  totalSaleReturnPaid: decimal("total_sale_return_paid", { precision: 12, scale: 2 }).default("0"),
  totalSaleReturnCount: integer("total_sale_return_count").default(0),
  totalSaleReturnQty: integer("total_sale_return_qty").default(0),
  totalSaleReturnDiscount: decimal("total_sale_return_discount", { precision: 12, scale: 2 }).default("0"),

  // Purchase Return
  totalPurchaseReturn: decimal("total_purchase_return", { precision: 12, scale: 2 }).default("0"),
  totalPurchaseReturnPaid: decimal("total_purchase_return_paid", { precision: 12, scale: 2 }).default("0"),
  totalPurchaseReturnCount: integer("total_purchase_return_count").default(0),
  totalPurchaseReturnQty: integer("total_purchase_return_qty").default(0),
  totalPurchaseReturnDiscount: decimal("total_purchase_return_discount", { precision: 12, scale: 2 }).default("0"),

  // Expense
  totalExpense: decimal("total_expense", { precision: 12, scale: 2 }).default("0"),
  totalExpenseCount: integer("total_expense_count").default(0),

  // Damage
  totalDamage: decimal("total_damage", { precision: 12, scale: 2 }).default("0"),
  totalDamageCount: integer("total_damage_count").default(0),
  totalDamageQty: integer("total_damage_qty").default(0),

  // Profit (calculated)
  profit: decimal("profit", { precision: 12, scale: 2 }).default("0"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
