import { pgTable, text, integer, varchar, timestamp, serial } from "drizzle-orm/pg-core";

export const categoryTable = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 })
        .unique()
        .notNull(),

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