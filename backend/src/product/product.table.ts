import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  serial,
  text,
  boolean,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { variantTable } from "./variant.table";
import { batchTable } from "./batch.table";
import { brandTable } from "../brand/brand.table";
import { categoryTable } from "../category/category.table";
import { unitTable } from "../unit/unit.table";
import { stockFlowTable } from "./stock_flow.table";

export const productTable = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 150 }).notNull(),

    slug: varchar("slug", { length: 300 }).unique().notNull(),

    description: text("description"),

    shortDescription: text("short_description"),

    metaTitle: varchar("meta_title", { length: 300 }),

    metaDescription: text("meta_description"),

    keywords: text("keywords").array().default([]),

    brandID: integer("brand_id").references(()=> brandTable.id),

    unitID: integer("unit_id").notNull().references(()=> unitTable.id),

    categoryID: integer("category_id").references(()=>categoryTable.id),

    manageStock: boolean("manage_stock").default(true).notNull(),

    manageWarranty: boolean("manage_warranty").default(false).notNull(),

    thumbnail: text("thumbnail"),

    video: text("video"),

    stock: numeric("stock", {mode:"number", precision:12, scale:3}).default(0).notNull(),

    totalSold: numeric("total_sold").default("0").notNull(),

    alertQty: numeric("alert_qty", {
      precision: 18,
      scale: 3,
      mode: "number"
    })
      .default(0)
      .notNull(),

    decimal: boolean("decimal").default(false).notNull(),

    purchasePrice: numeric("purchase_price", {mode:"number", precision:12, scale:2}).default(0).notNull(),

    salePrice: numeric("sale_price", {
      precision: 12,
      scale: 2,
      mode: "number"
    }).default(0).notNull(),

    isPublished: boolean("is_published").default(false).notNull(),

    inPosList: boolean("in_pos_list").default(false).notNull(),

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

    sku: varchar("sku", { length: 100 }).unique(),

    status: varchar("status", { length: 20 }).default("active").notNull(),
    // active → live product | inactive → disabled, hidden product | draft → unpublished | archived → old history
    featured: boolean("featured").default(false).notNull(),

    showStock: boolean("show_stock").default(true).notNull(),

    sortOrder: integer("sort_order").default(0).notNull(),

    averageRating: numeric("average_rating").default("0").notNull(),

    totalReviews: integer("total_reviews").default(0).notNull(),
  },
  (table) => [
    // barcode empty/null হলে ignore করবে
    // uniqueIndex("products_barcode_unique")
    //   .on(table.barcode)
    //   .where(sql`${table.barcode} IS NOT NULL AND ${table.barcode} <> ''`),
  ],
);

export const productRelations = relations(productTable, ({ one, many }) => ({
  // ১. ব্র্যান্ডের সাথে রিলেশন (যেহেতু প্রতিটি প্রোডাক্টের একটি নির্দিষ্ট ব্র্যান্ড থাকবে)
  brand: one(brandTable, {
    fields: [productTable.brandID], // প্রোডাক্ট টেবিলের কোন কলাম
    references: [brandTable.id],    // ব্র্যান্ড টেবিলের কোন কলাম
  }),

  category: one(categoryTable, {
    fields: [productTable.categoryID],
    references: [categoryTable.id],
  }),

  unit: one(unitTable, {
    fields: [productTable.unitID],
    references: [unitTable.id],
  }),

  variants: many(variantTable),
  batches: many(batchTable),
  stockFlows: many(stockFlowTable),
}));