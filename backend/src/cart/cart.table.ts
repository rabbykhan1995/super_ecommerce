import {
  pgTable,
  timestamp,
  serial,
  integer,
  numeric,
  varchar,
  text,
  uuid,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { userTable } from "../auth/auth.table";
import { productTable } from "../product/product.table";
import { variantTable } from "../product/variant.table";

export const cartTable = pgTable(
  "carts",
  {
    id: serial("id").primaryKey(),

    userID: uuid("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),

    productID: integer("product_id")
      .notNull()
      .references(() => productTable.id, { onDelete: "cascade" }),

    variantID: integer("variant_id")
      .notNull()
      .references(() => variantTable.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 150 }).notNull(),

    price: numeric("price", {
      precision: 12,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),

    discountPrice: numeric("discount_price", {
      precision: 12,
      scale: 2,
      mode: "number",
    }),

    slug: varchar("slug", { length: 300 }).notNull(),

    thumbnail: text("thumbnail"),

    attributes: jsonb("attributes"),

    quantity: numeric("quantity", {
      precision: 10,
      scale: 2,
      mode: "number",
    })
      .default(1)
      .notNull(),

    stock: numeric("stock", {
      precision: 12,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),

    addedAt: timestamp("added_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("carts_user_id_idx").on(table.userID),
    index("carts_product_id_idx").on(table.productID),
    index("carts_variant_id_idx").on(table.variantID),
  ]
);

export const cartRelations = relations(cartTable, ({ one }) => ({
  user: one(userTable, {
    fields: [cartTable.userID],
    references: [userTable.id],
  }),
  product: one(productTable, {
    fields: [cartTable.productID],
    references: [productTable.id],
  }),
  variant: one(variantTable, {
    fields: [cartTable.variantID],
    references: [variantTable.id],
  }),
}));
