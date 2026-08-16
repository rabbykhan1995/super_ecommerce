import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userTable } from "../auth/auth.table";


// Platform enum - future e ios/windows/linux add korle just enum e value boshaite hobe
export const platformEnum = pgEnum("platform", [
  "android",
  "ios",
  "windows",
  "linux",
]);

export const notificationTable = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Device install identifier - client (mobile app) generate kore pathabe
    deviceID: varchar("device_id", { length: 255 }).notNull(),

    // Expo / FCM / APNs push token
    pushToken: varchar("push_token", { length: 512 }).notNull(),

    // Nullable - login er age null thakbe
    userID: uuid("user_id").references(() => userTable.id, {
      onDelete: "set null",
    }),

    platform: platformEnum("platform").notNull(),

    // Optional but recommended - debugging / targeted rollout er jonno
    appVersion: varchar("app_version", { length: 50 }),

    // Token invalid/uninstall hole false kore dao, delete na kore
    isActive: boolean("is_active").notNull().default(true),

    // Token refresh / app open hoile update koro
    lastUsedAt: timestamp("last_used_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // deviceId unique - ekta device er jonno ekta e row thakbe, upsert korar jonno dorkar
    deviceIdUnique: uniqueIndex("notification_device_id_unique").on(
      table.deviceID,
    ),

    // userId diye query fast korar jonno (shob device fetch korte)
    userIdIdx: index("notification_user_id_idx").on(table.userID),

    // sending time e active token filter fast korar jonno
    activeIdx: index("notification_is_active_idx").on(table.isActive),
  }),
);

export const notificationRelations = relations(notificationTable, ({ one }) => ({
  user: one(userTable, {
    fields: [notificationTable.userID],
    references: [userTable.id],
  }),
}));

