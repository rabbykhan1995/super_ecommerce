import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ===========================
   Users
=========================== */

export const userTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),

    openID: varchar("open_id", { length: 255 }),

    image: varchar("image", { length: 500 }),

    password: varchar("password", { length: 255 }),

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
  (table) => [
    uniqueIndex("users_open_id_unique").on(table.openID),
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_mobile_unique").on(table.mobile),
  ]
);

/* ===========================
   Staff Profiles
=========================== */

export const staffProfiles = pgTable("staff_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => userTable.id, {
      onDelete: "cascade",
    }),

  employeeCode: varchar("employee_code", { length: 50 })
    .notNull()
    .unique(),

  designation: varchar("designation", { length: 100 }),

  department: varchar("department", { length: 100 }),

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

/* ===========================
   Roles
=========================== */

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 100 })
    .notNull()
    .unique(),

  description: varchar("description", { length: 255 }),
});

/* ===========================
   User Roles
=========================== */

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
      }),

    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
(table) => [
  uniqueIndex("unique_user_role").on(
    table.userId,
    table.roleId,
  ),
]
);

/* ===========================
   Relations
=========================== */

export const userRelations = relations(userTable, ({ one, many }) => ({
  staffProfile: one(staffProfiles, {
    fields: [userTable.id],
    references: [staffProfiles.userId],
  }),

  userRoles: many(userRoles),
}));

export const staffProfileRelations = relations(
  staffProfiles,
  ({ one }) => ({
    user: one(userTable, {
      fields: [staffProfiles.userId],
      references: [userTable.id],
    }),
  }),
);

export const roleRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRoleRelations = relations(userRoles, ({ one }) => ({
  user: one(userTable, {
    fields: [userRoles.userId],
    references: [userTable.id],
  }),

  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));