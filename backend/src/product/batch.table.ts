import {
    pgTable,
    timestamp,
    serial,
    boolean,
    integer,
    numeric,
    index,
} from "drizzle-orm/pg-core";

export const batchTable = pgTable(
    "batches",
    {
        id: serial("id").primaryKey(),

        serial: integer("serial").unique(),

        productID: integer("product_id").notNull(),

        variantID: integer("variant_id").notNull(),

        purchaseID: integer("purchase_id").notNull(),

        cost: numeric("cost").default("0"),

        purchasedQty: numeric("purchased_qty").default("0"),

        soldQty: numeric("sold_qty").default("0"),

        damagedQty: numeric("damaged_qty").default("0"),

        remainingQty: numeric("remaining_qty").default("0"),

        purchaseReturnedQty: numeric("purchase_return_qty").default("0"),

        saleReturnedQty: numeric("sale_return_qty").default("0"),

        purchaseDate: timestamp("purchase_date", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),

        expireDate: timestamp("expire_date", {
            withTimezone: true,
        }).$type<Date | null>(),


        isActive: boolean("is_active").default(true),

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
        index("batches_product_id_idx").on(table.productID),
        index("batches_variant_id_idx").on(table.variantID),
        index("batches_purchase_id_idx").on(table.purchaseID),
    ],
);
