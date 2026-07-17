import { relations } from "drizzle-orm";
import { pgTable, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { productTable } from "../product/product.table";

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


