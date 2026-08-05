import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  numeric,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { contactTable } from "../contact/contact.table";

export const paymentTypeEnum = pgEnum("payment_type", [
  "customer_receive", // Customer থেকে টাকা নেওয়া
  "customer_pay",     // Customer কে টাকা দেওয়া
  "supplier_pay",     // Supplier কে টাকা দেওয়া
  "supplier_receive", // Supplier থেকে টাকা ফেরত পাওয়া
]);

export const paymentTable = pgTable("payments", {
  id: serial("id").primaryKey(),

  contactID: integer("contact_id")
    .notNull()
    .references(() => contactTable.id),

  type: paymentTypeEnum("type").notNull(),

  amount: numeric("amount", {
    precision: 12,
    scale: 2,
    mode: "number",
  }).notNull(),

  balanceBefore: numeric("balance_before", {
    precision: 12,
    scale: 2,
    mode: "number",
  }).default(0).notNull(),

  balanceAfter: numeric("balance_after", {
    precision: 12,
    scale: 2,
    mode: "number",
  }).default(0).notNull(),

  note: text("note"),

  paymentDate: timestamp("payment_date", {
    withTimezone: true,
  }).defaultNow().notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow().notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).defaultNow().notNull(),
});

export const paymentRelations = relations(paymentTable, ({ one }) => ({
  contact: one(contactTable, {
    fields: [paymentTable.contactID],
    references: [contactTable.id],
  }),
}));
