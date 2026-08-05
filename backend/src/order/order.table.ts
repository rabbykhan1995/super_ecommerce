import { relations } from "drizzle-orm";
import { pgTable, varchar, timestamp, serial, text, integer, numeric, jsonb, pgEnum, boolean } from "drizzle-orm/pg-core";
import { productTable } from "../product/product.table";

import { saleTable } from "../sale/sale.table";
import { variantTable } from "../product/variant.table";
import { contactTable } from "../contact/contact.table";

// ─── Order ──────────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum("order_status", [
  "Pending","Confirmed","Packed","Shipped","Hold","Returned","Cancelled", "Delivered"
]);

export const orderFromEnum = pgEnum("order_from",["Ecommerce","Manual"]);

export const orderTable = pgTable("orders", {
    id: serial("id").primaryKey(),
    
    contactID: integer("contact_id").notNull().references(() => contactTable.id),

    saleID: integer("sale_id").references(() => saleTable.id),

    status: orderStatusEnum("status").notNull().default("Pending"),

    lastStatus:orderStatusEnum("last_status"),

    subtotal: numeric("subtotal", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),

    shippingCost: numeric("shipping_cost", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),

    discount: numeric("discount", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),

    totalAmount: numeric("total_amount", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),

    paymentMethod: varchar("payment_method", { length: 30 }),

    paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("unpaid"),

    stripeSessionID: varchar("stripe_session_id", { length: 255 }),

    stripePaymentIntent: varchar("stripe_payment_intent", { length: 255 }),

    paidAt: timestamp("paid_at", { withTimezone: true }),

    shippingName: varchar("shipping_name", { length: 255 }).notNull(),

    shippingPhone: varchar("shipping_phone", { length: 20 }).notNull(),

    shippingAddress: text("shipping_address").notNull(),

    shippingCity: varchar("shipping_city", { length: 100 }),

    shippingArea: varchar("shipping_area", { length: 100 }),

    note: text("note"),

    orderFrom: orderFromEnum("order_from").notNull().default("Ecommerce"),

    orderedBy:varchar("ordered_by"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
// ─── Order Item ─────────────────────────────────────────────────────────────
export const orderItemTable = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderID: integer("order_id").notNull().references(() => orderTable.id, { onDelete: "cascade" }),
    productID: integer("product_id").notNull().references(() => productTable.id),
    variantID: integer("variant_id").notNull().references(() => variantTable.id),
    salePrice: numeric("sale_price", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),
    quantity: numeric("quantity", { mode: "number", precision: 10, scale: 2 }).notNull().default(1),
    lineTotal: numeric("line_total", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),
    serial: varchar("serial"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ──────────────────────────────────────────────────────────────

export const orderRelations = relations(orderTable, ({ one, many }) => ({
    contact: one(contactTable, { fields: [orderTable.contactID], references: [contactTable.id] }),
    sale: one(saleTable, { fields: [orderTable.saleID], references: [saleTable.id] }),
    items: many(orderItemTable),
}));

export const orderItemRelations = relations(orderItemTable, ({ one }) => ({
    order: one(orderTable, { fields: [orderItemTable.orderID], references: [orderTable.id] }),
    product: one(productTable, { fields: [orderItemTable.productID], references: [productTable.id] }),
    variant: one(variantTable, { fields: [orderItemTable.variantID], references: [variantTable.id] }),
}));
