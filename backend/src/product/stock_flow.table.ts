import {
    pgTable,
    pgEnum,
    serial,
    integer,
    numeric,
    timestamp,
    varchar,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { batchTable } from "./batch.table";
import { productTable } from "./product.table";
import { variantTable } from "./variant.table";

export const stockFlowTypeEnum = pgEnum("stock_flow_type", [
    "in",
    "out",
]);

export const stockFlowReferenceTypeEnum = pgEnum(
    "stock_flow_reference_type",
    [
        "purchase",
        "purchase_return",
        "sale",
        "sale_return",
        "damage",
        "adjustment",
        "opening_stock",
        "stock_transfer",
    ]
);

export const stockFlowTable = pgTable(
    "stock_flows",
    {
        id: serial("id").primaryKey(),

        batchID: integer("batch_id")
            .notNull()
            .references(() => batchTable.id, {
                onDelete: "cascade",
            }),

        productID: integer("product_id")
            .notNull()
            .references(() => productTable.id),

        variantID: integer("variant_id").references(() => variantTable.id),

        type: stockFlowTypeEnum("type").notNull(), // in | out

        referenceType: stockFlowReferenceTypeEnum("reference_type").notNull(),

        referenceID: integer("reference_id").$type<number | null>(),

        qty: numeric("qty", {
            precision: 12,
            scale: 2, mode: "number"
        }).default(0).notNull(),

        beforeQty: numeric("before_qty", {
            precision: 12,
            scale: 2, mode: "number"
        }).default(0).notNull(),

        afterQty: numeric("after_qty", {
            precision: 12,
            scale: 2,
            mode: "number"
        }).default(0).notNull(),

        remarks: varchar("remarks", {
            length: 255,
        }),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("stock_flows_batch_idx").on(table.batchID),
        index("stock_flows_product_idx").on(table.productID),
        index("stock_flows_variant_idx").on(table.variantID),
        index("stock_flows_reference_idx").on(
            table.referenceType,
            table.referenceID
        ),
    ]
);


export const stockFlowRelations = relations(
    stockFlowTable,
    ({ one, }) => ({
        batch: one(batchTable, {
            fields: [stockFlowTable.batchID],
            references: [batchTable.id],
        }),

        product: one(productTable, {
            fields: [stockFlowTable.productID],
            references: [productTable.id],
        }),

        variant: one(variantTable, {
            fields: [stockFlowTable.variantID],
            references: [variantTable.id],
        }),

    })
);