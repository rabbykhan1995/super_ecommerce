import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),

    openID: varchar("open_id", { length: 255 }),

    image: varchar("image", { length: 500 }),

    password: varchar("password", { length: 255 }),

    admin: boolean("admin").default(false).notNull(),

    email: varchar("email", { length: 255 }),

    mobile: varchar("mobile", { length: 20 }),

    address: varchar("address", { length: 500 }),

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
  },
  (table) => ({
    openIDUnique: uniqueIndex("users_open_id_unique").on(table.openID),

    emailUnique: uniqueIndex("users_email_unique").on(table.email),

    mobileUnique: uniqueIndex("users_mobile_unique").on(table.mobile),
  }),
);