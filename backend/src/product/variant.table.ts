import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  serial,
  text,
  boolean,
  integer,
  numeric,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const variantTable = pgTable(
  "variants",
  {
    id: serial("id").primaryKey(),

    productID: integer("product_id").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    sku: varchar("sku", { length: 100 }).unique(),
  },
  (table) => [index("products_name_idx").on(table.productID)],
);
