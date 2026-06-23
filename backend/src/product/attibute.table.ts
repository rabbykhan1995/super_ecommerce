import {
  pgTable,
  varchar,
  timestamp,
  serial,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { variantTable } from "./variant.table";

export const variantAttributes = pgTable("variant_attributes", {
  id: serial("id").primaryKey(),

  variantId: integer("variant_id")
    .notNull()
    .references(() => variantTable.id, { onDelete: "cascade" }),

  name: text("name").notNull(), // e.g. "size", "color"
  value: text("value").notNull(), // e.g. "large", "red"
});
