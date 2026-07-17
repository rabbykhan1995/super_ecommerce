import { relations } from "drizzle-orm";
import { pgTable, varchar, timestamp, serial, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { productTable } from "../product/product.table";

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


