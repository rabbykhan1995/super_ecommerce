import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  numeric,
} from "drizzle-orm/pg-core";

import { saleTable } from "../sale/sale.table";
import { contactTable } from "../contact/contact.table";

export const parcelTable = pgTable(
  "parcels",
  {
    id: serial("id").primaryKey(),

    saleID: integer("sale_id")
      .notNull()
      .references(() => saleTable.id, { onDelete: "cascade" }),

    customerID: integer("customer_id").references(() => contactTable.id, {
      onDelete: "set null",
    }),

    parcelType: varchar("parcel_type", { length: 20 })
      .notNull()
      .default("local"),

    address: text("address").notNull(),

    courierName: varchar("courier_name", { length: 100 }),

    thirdPartyTrackingNo: varchar("third_party_tracking_no", {
      length: 255,
    }),

    localParcelNo: varchar("local_parcel_no", { length: 255 }),

    status: varchar("status", { length: 50 }).notNull().default("pending"),

    note: text("note"),

    shippingCost: numeric("shipping_cost", {
      precision: 12,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),

    codAmount: numeric("cod_amount", {
      precision: 12,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),

    dueAmount: numeric("due_amount", {
      precision: 12,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),

    parcelDate: timestamp("parcel_date", { withTimezone: true })
      .defaultNow()
      .notNull(),

    deletable: boolean("deletable").default(true).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("parcels_sale_id_idx").on(table.saleID),
    index("parcels_customer_id_idx").on(table.customerID),
    index("parcels_status_idx").on(table.status),
    index("parcels_tracking_no_idx").on(table.thirdPartyTrackingNo),
  ]
);

export const parcelRelations = relations(parcelTable, ({ one }) => ({
  sale: one(saleTable, {
    fields: [parcelTable.saleID],
    references: [saleTable.id],
  }),
  customer: one(contactTable, {
    fields: [parcelTable.customerID],
    references: [contactTable.id],
  }),
}));
