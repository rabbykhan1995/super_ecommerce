import { relations } from "drizzle-orm";
import { pgTable, varchar, timestamp, serial, text, integer, numeric, uuid, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { productTable } from "../product/product.table";
import { userTable } from "../auth/auth.table";
import { saleTable } from "../sale/sale.table";
import { variantTable } from "../product/variant.table";

// ─── Order ──────────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum("order_status", [
  "Pending","Confirmed","Packed","Shipped","Hold","Returned","Cancelled", "Delivered"
]);

export const orderFromEnum = pgEnum("order_from",["Ecommerce","Manual"]);

export const orderTable = pgTable("ecom_orders", {
    id: serial("id").primaryKey(),
    
    userID: uuid("user_id").notNull().references(() => userTable.id),

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
});

// ─── Order Item ─────────────────────────────────────────────────────────────

export const orderItemTable = pgTable("ecom_order_items", {
    id: serial("id").primaryKey(),
    orderID: integer("order_id").notNull().references(() => orderTable.id, { onDelete: "cascade" }),
    productID: integer("product_id").notNull().references(() => productTable.id),
    variantID: integer("variant_id").notNull().references(() => variantTable.id),
    productName: varchar("product_name", { length: 255 }).notNull(),
    variantAttrs: jsonb("variant_attrs").$type<{ name: string; value: string }[]>(),
    thumbnail: text("thumbnail"),
    salePrice: numeric("sale_price", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),
    discountPrice: numeric("discount_price", { mode: "number", precision: 12, scale: 2 }),
    quantity: numeric("quantity", { mode: "number", precision: 10, scale: 2 }).notNull().default(1),
    lineTotal: numeric("line_total", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),
    serial: varchar("serial"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ──────────────────────────────────────────────────────────────

export const orderRelations = relations(orderTable, ({ one, many }) => ({
    user: one(userTable, { fields: [orderTable.userID], references: [userTable.id] }),
    sale: one(saleTable, { fields: [orderTable.saleID], references: [saleTable.id] }),
    items: many(orderItemTable),
}));

export const orderItemRelations = relations(orderItemTable, ({ one }) => ({
    order: one(orderTable, { fields: [orderItemTable.orderID], references: [orderTable.id] }),
    product: one(productTable, { fields: [orderItemTable.productID], references: [productTable.id] }),
    variant: one(variantTable, { fields: [orderItemTable.variantID], references: [variantTable.id] }),
}));
