import {
  pgTable,
  varchar,
  timestamp,
  serial,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";

export const accountTable = pgTable("accounts", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  branch: varchar("branch", { length: 100 }).default(""),

  balance: numeric("balance")
    .notNull()
    .default("0"),

  number: varchar("number", { length: 50 }).notNull(),

  isDefault: boolean("is_default").notNull().default(false),

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
});