import {
  boolean,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { contactTable } from "../contact/contact.table";

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

  userID: uuid("user_id")
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

  isSuperAdmin: boolean("is_super_admin").default(false).notNull(),

  description: varchar("description", { length: 255 }),
});

/* ===========================
   User Roles
=========================== */

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userID: uuid("user_id")
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
      table.userID,
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
    references: [staffProfiles.userID],
  }),
  contact: one(contactTable),
  userRoles: many(userRoles),
}));

export const staffProfileRelations = relations(
  staffProfiles,
  ({ one }) => ({
    user: one(userTable, {
      fields: [staffProfiles.userID],
      references: [userTable.id],
    }),
  }),
);

export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),

  // convention: "resource:action" -> "product:create", "ledger:list"
  name: varchar("name", { length: 150 }).notNull().unique(),

  description: varchar("description", { length: 255 }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});


export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),

    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("unique_role_permission").on(
      table.roleId,
      table.permissionId,
    ),
  ],
);

export const userRoleRelations = relations(userRoles, ({ one }) => ({
  user: one(userTable, {
    fields: [userRoles.userID],
    references: [userTable.id],
  }),

  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));


export const roleRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

export const permissionRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);