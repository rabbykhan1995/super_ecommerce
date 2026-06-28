import {
    pgTable,
    timestamp,
    serial,
    boolean,
    integer,
    numeric,
    index,
    varchar,
} from "drizzle-orm/pg-core";
import { productTable } from "./product.table";
import { variantTable } from "./variant.table";
import { relations } from "drizzle-orm";
import { purchaseTable } from "../purchase/purchase.table";
import { stockFlowTable } from "./stock_flow.table";

// export const batchTable = pgTable(
//     "batches",
//     {
//         id: serial("id").primaryKey(),

//         serial: varchar("serial").unique(),

//         productID: integer("product_id").notNull().references(() => productTable.id, {
//             onDelete: "cascade",
//         }),

//         variantID: integer("variant_id").notNull().references(() => variantTable.id),
//         // ekhanew same reference jog korte hobe
//         purchaseID: integer("purchase_id").references(() => purchaseTable.id),

//         cost: numeric("cost").default("0"),

//         purchasedQty: numeric("purchased_qty").default("0"),

//         soldQty: numeric("sold_qty").default("0"),

//         damagedQty: numeric("damaged_qty").default("0"),

//         remainingQty: numeric("remaining_qty").default("0"),

//         purchaseReturnedQty: numeric("purchase_return_qty").default("0"),

//         saleReturnedQty: numeric("sale_return_qty").default("0"),

//         purchaseDate: timestamp("purchase_date", {
//             withTimezone: true,
//         })
//             .defaultNow()
//             .notNull(),

//         expireDate: timestamp("expire_date", {
//             withTimezone: true,
//         }).$type<Date | null>(),


//         isActive: boolean("is_active").default(true),

//         createdAt: timestamp("created_at", {
//             withTimezone: true,
//         })
//             .defaultNow()
//             .notNull(),

//         updatedAt: timestamp("updated_at", {
//             withTimezone: true,
//         })
//             .defaultNow()
//             .notNull(),

//     },
//     (table) => [
//         index("batches_product_id_idx").on(table.productID),
//         index("batches_variant_id_idx").on(table.variantID),
//         index("batches_purchase_id_idx").on(table.purchaseID),
//     ],
// );


// ব্যাচের রিলেশন

export const batchTable = pgTable(
  "batches",
  {
    id: serial("id").primaryKey(),

    serial: varchar("serial").unique(),

    productID: integer("product_id")
      .notNull()
      .references(() => productTable.id, {
        onDelete: "cascade",
      }),

    variantID: integer("variant_id")
      .notNull()
      .references(() => variantTable.id),

    purchaseID: integer("purchase_id").references(
      () => purchaseTable.id
    ),

    // Purchase snapshot
    cost: numeric("cost", {
      precision: 12,
      scale: 2,
      mode:"number"
    })
      .default(0)
      .notNull(),

    purchasedQty: numeric("purchased_qty", {
      precision: 12,
      scale: 2
      ,
      mode:"number"
    })
      .default(0)
      .notNull(),

    // Current stock (cache)
    remainingQty: numeric("remaining_qty", {
      precision: 12,
      scale: 2,
      mode:"number"
    })
      .default(0)
      .notNull(),

    purchaseDate: timestamp("purchase_date", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    expireDate: timestamp("expire_date", {
      withTimezone: true,
    }).$type<Date | null>(),

    isActive: boolean("is_active")
      .default(true)
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
  },
  (table) => [
    index("batches_product_idx").on(table.productID),
    index("batches_variant_idx").on(table.variantID),
    index("batches_purchase_idx").on(table.purchaseID),
  ]
);


export const batchRelations = relations(batchTable, ({ one, many }) => ({
    product: one(productTable, {
        fields: [batchTable.productID],
        references: [productTable.id],
    }),
    variant: one(variantTable, {
        fields: [batchTable.variantID],
        references: [variantTable.id],
    }),

    purchase: one(purchaseTable, {
        fields: [batchTable.purchaseID],
        references: [purchaseTable.id],
    }),
        stockFlows: many(stockFlowTable),
}));