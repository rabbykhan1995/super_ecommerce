import { relations } from "drizzle-orm";
import { pgTable, varchar, timestamp, serial, text, integer, boolean } from "drizzle-orm/pg-core";

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
