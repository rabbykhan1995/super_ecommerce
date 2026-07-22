import { relations } from "drizzle-orm";
import { pgTable, varchar, timestamp, serial, text, integer, boolean, numeric, uuid, jsonb } from "drizzle-orm/pg-core";
import { productTable } from "../product/product.table";
import { userTable } from "../auth/auth.table";
import { saleTable } from "../sale/sale.table";
import { variantTable } from "../product/variant.table";

// ─── Banner ──────────────────────────────────────────────────────────────────

export const bannerTable = pgTable("banners", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    photo: text("photo").notNull(),
    link: text("link"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Flash Sale ──────────────────────────────────────────────────────────────

export const flashSaleTable = pgTable("flash_sales", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const flashSaleRelations = relations(flashSaleTable, ({ many }) => ({
    products: many(flashSaleProductTable),
}));

export const flashSaleProductTable = pgTable("flash_sale_products", {
    id: serial("id").primaryKey(),
    flashSaleID: integer("flash_sale_id").notNull().references(() => flashSaleTable.id, { onDelete: "cascade" }),
    productID: integer("product_id").notNull().references(() => productTable.id, { onDelete: "cascade" }),
    discountPrice: numeric("discount_price", { precision: 12, scale: 2, mode: "number" }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const flashSaleProductRelations = relations(flashSaleProductTable, ({ one }) => ({
    flashSale: one(flashSaleTable, {
        fields: [flashSaleProductTable.flashSaleID],
        references: [flashSaleTable.id],
    }),
    product: one(productTable, {
        fields: [flashSaleProductTable.productID],
        references: [productTable.id],
    }),
}));

// ─── Featured Product ────────────────────────────────────────────────────────

export const featuredProductTable = pgTable("featured_products", {
    id: serial("id").primaryKey(),
    productID: integer("product_id").notNull().references(() => productTable.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const featuredProductRelations = relations(featuredProductTable, ({ one }) => ({
    product: one(productTable, {
        fields: [featuredProductTable.productID],
        references: [productTable.id],
    }),
}));

// ─── Ecom Order ──────────────────────────────────────────────────────────────

export const ecomOrderTable = pgTable("ecom_orders", {
    id: serial("id").primaryKey(),
    userID: uuid("user_id").notNull().references(() => userTable.id),
    saleID: integer("sale_id").references(() => saleTable.id),
    orderNo: varchar("order_no", { length: 50 }).notNull().unique(),

    status: varchar("status", { length: 30 }).notNull().default("pending"),

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

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ecomOrderItemTable = pgTable("ecom_order_items", {
    id: serial("id").primaryKey(),
    orderID: integer("order_id").notNull().references(() => ecomOrderTable.id, { onDelete: "cascade" }),
    productID: integer("product_id").notNull().references(() => productTable.id),
    variantID: integer("variant_id").notNull().references(() => variantTable.id),

    productName: varchar("product_name", { length: 255 }).notNull(),
    variantAttrs: jsonb("variant_attrs").$type<{ name: string; value: string }[]>(),
    thumbnail: text("thumbnail"),

    salePrice: numeric("sale_price", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),
    discountPrice: numeric("discount_price", { mode: "number", precision: 12, scale: 2 }),
    quantity: numeric("quantity", { mode: "number", precision: 10, scale: 2 }).notNull().default(1),
    lineTotal: numeric("line_total", { mode: "number", precision: 12, scale: 2 }).notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ecomOrderRelations = relations(ecomOrderTable, ({ one, many }) => ({
    user: one(userTable, { fields: [ecomOrderTable.userID], references: [userTable.id] }),
    sale: one(saleTable, { fields: [ecomOrderTable.saleID], references: [saleTable.id] }),
    items: many(ecomOrderItemTable),
}));

export const ecomOrderItemRelations = relations(ecomOrderItemTable, ({ one }) => ({
    order: one(ecomOrderTable, { fields: [ecomOrderItemTable.orderID], references: [ecomOrderTable.id] }),
    product: one(productTable, { fields: [ecomOrderItemTable.productID], references: [productTable.id] }),
    variant: one(variantTable, { fields: [ecomOrderItemTable.variantID], references: [variantTable.id] }),
}));
