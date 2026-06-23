import {
  pgTable,
  serial,
  text,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { variantTable } from "./variant.table";
import { relations } from "drizzle-orm";

export const variantAttributes = pgTable("variant_attributes", {

  id: serial("id").primaryKey(),

  variantID: integer("variant_id")
    .notNull()
    .references(() => variantTable.id, { onDelete: "cascade" }),

  name: text("name").notNull(), // e.g. "size", "color"

  value: text("value").notNull(), // e.g. "large", "red"

}, (table)=>[
  index("variant_attributes_variant_id_idx").on(table.variantID)
]);


export const variantAttributesRelations = relations(variantAttributes, ({ one }) => ({
  variant: one(variantTable, {
    fields: [variantAttributes.variantID],
    references: [variantTable.id],
  }),
}));