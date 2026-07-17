import {
  Batch,
  BatchPayload,
  EcomProductQuery,
  Product,
  ProductPayload,
  StockFlowColumn,
  stockFlowPayload,
  UpdateProductInput,
  Variant,
  VariantPayload,
} from "./product.type";
import { productTable } from "./product.table";
import db, { QueryClient } from "../../drizzle/src";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  ne,
  or,
  SQL,
  sql,
} from "drizzle-orm";
import { batchTable } from "./batch.table";
import { paginateQuery } from "../../utils/queryBuilder";
import { variantTable } from "./variant.table";
import { stockFlowTable } from "./stock_flow.table";

export default class ProductRepository {
  static async findByField<K extends keyof Product>(
    fieldName: K,
    fieldVal: Product[K],
  ) {
    const [product] = await db
      .select()
      .from(productTable)
      .where(eq(productTable[fieldName] as any, fieldVal as any));

    return product ?? null;
  }

  static async findByFieldExceptId<K extends keyof Product>(
    fieldName: K,
    fieldVal: Product[K],
    excludeId: number,
  ) {
    const [product] = await db
      .select()
      .from(productTable)
      .where(
        and(
          eq(productTable[fieldName] as any, fieldVal as any),
          ne(productTable.id, excludeId),
        ),
      );

    return product ?? null;
  }

  static async findManyByField<K extends keyof Product>(
    fieldName: K,
    fieldVal: Product[K],
  ): Promise<Product[]> {
    return db
      .select()
      .from(productTable)
      .where(eq(productTable[fieldName] as any, fieldVal as any));
  }
  static async findByID(
    productID: number,
    client: QueryClient = db,
  ): Promise<Product | null> {
    const [product] = await client
      .select()
      .from(productTable)
      .where(eq(productTable.id, productID))
      .limit(1);

    return product ?? null;
  }

  static async findBatchByID(
    batchID: number,
    client: QueryClient = db,
  ): Promise<Batch | null> {
    const [batch] = await client
      .select()
      .from(batchTable)
      .where(eq(batchTable.id, batchID))
      .limit(1);

    return batch ?? null;
  }
  static async findBatchByIDForSale(
    batchID: number,
    client: QueryClient = db,
  ): Promise<Batch | null> {
    const [batch] = await client
      .select()
      .from(batchTable)
      .where(eq(batchTable.id, batchID))
      .for("update")
      .limit(1);

    return batch ?? null;
  }

  static async findOneBatch<K extends keyof Batch>(
    fieldName: K,
    fieldVal: Batch[K],
    client: QueryClient = db,
  ): Promise<Batch | null> {
    const [batch] = await client
      .select()
      .from(batchTable)
      .where(eq(batchTable[fieldName] as any, fieldVal as any))
      .orderBy(asc(batchTable.purchaseDate))
      .limit(1);

    return batch ?? null;
  }

  static async countProduct<K extends keyof Product>(
    fieldName: K,
    fieldVal: Product[K],
    client: QueryClient = db,
  ): Promise<number> {
    const [result] = await client
      .select({
        total: count(),
      })
      .from(productTable)
      .where(eq(productTable[fieldName] as any, fieldVal as any));

    return Number(result.total);
  }
  static async createProduct(
    payload: ProductPayload,
    client: QueryClient = db,
  ): Promise<Product | null> {
    const [product] = await client
      .insert(productTable)
      .values(payload)
      .returning();

    return product ?? null;
  }

  static async createVariant(
    payload: VariantPayload,
    client: QueryClient = db,
  ): Promise<Variant | null> {
    const [variant] = await client
      .insert(variantTable)
      .values(payload)
      .returning();

    return variant ?? null;
  }

  static async createBatch(
    payload: BatchPayload,
    client: QueryClient = db,
  ): Promise<Batch | null> {
    const [batch] = await client.insert(batchTable).values(payload).returning();

    return batch ?? null;
  }

  static async findVariantByBarcode(
    barcode: string,
    client: QueryClient = db,
  ): Promise<Variant | null> {
    const [variant] = await client
      .select()
      .from(variantTable)
      .where(eq(variantTable.barcode, barcode))
      .limit(1);

    return variant ?? null;
  }

  static async findVariantByID(
    variantID: number,
    client: QueryClient = db,
  ): Promise<Variant | null> {
    const [variant] = await client
      .select()
      .from(variantTable)
      .where(eq(variantTable.id, variantID))
      .limit(1);

    return variant ?? null;
  }

  static async findVariantByBarcodeExceptID(
    barcode: string,
    variantID: number,
    client: QueryClient = db,
  ): Promise<Variant | null> {
    const [variant] = await client
      .select()
      .from(variantTable)
      .where(
        and(eq(variantTable.barcode, barcode), ne(variantTable.id, variantID)),
      )
      .limit(1);

    return variant ?? null;
  }

  static async updateProduct(
    productID: number,
    payload: UpdateProductInput,
    client: QueryClient = db,
  ): Promise<Product | null> {
    const [product] = await client
      .update(productTable)
      .set(payload)
      .where(eq(productTable.id, productID))
      .returning();

    return product ?? null;
  }

  static async updateVariant(
    variantID: number,
    payload: Partial<VariantPayload>,
    client: QueryClient = db,
  ): Promise<Variant | null> {
    const [variant] = await client
      .update(variantTable)
      .set(payload)
      .where(eq(variantTable.id, variantID))
      .returning();

    return variant ?? null;
  }

  static async FullStructuredProductByID(
    productID: number,
    client: QueryClient = db,
  ) {
    return client.query.productTable.findFirst({
      where: eq(productTable.id, productID),
      with: {
        brand: true,
        unit: true,
        category: true,
        variants: true,
      },
    });
  }

  static async FullStructuredProductBySlug(
    slug: string,
    client: QueryClient = db,
  ) {
    return client.query.productTable.findFirst({
      where: eq(productTable.slug, slug),
      with: {
        brand: true,
        unit: true,
        category: true,
        variants: true,
      },
    });
  }

  static async batchByVariantID(
    variantID: number,
    client: QueryClient = db,
  ): Promise<Batch[]> {
    return client
      .select()
      .from(batchTable)
      .where(
        and(
          eq(batchTable.variantID, variantID),
          gt(batchTable.remainingQty, 0),
        ),
      )
      .orderBy(asc(batchTable.purchaseDate));
  }

  static async fifoBatchesByVariantID(
    variantID: number,
    client: QueryClient = db,
  ): Promise<Batch[]> {
    return client
      .select()
      .from(batchTable)
      .where(
        and(
          eq(batchTable.variantID, variantID),
          gt(batchTable.remainingQty, 0),
        ),
      )
      .for("update")
      .orderBy(asc(batchTable.purchaseDate));
  }

  static async serialByProductID(
    productID: number,
    client: QueryClient = db,
  ): Promise<Batch[]> {
    return client
      .select()
      .from(batchTable)
      .where(
        and(
          eq(batchTable.productID, productID),
          eq(batchTable.isActive, true),
          isNotNull(batchTable.serial),
          gt(batchTable.remainingQty, 0),
        ),
      );
  }

  static async findBatchBySerial(
    serial: string,
    client: QueryClient = db,
  ): Promise<Batch | null> {
    const [batch] = await client
      .select()
      .from(batchTable)
      .where(eq(batchTable.serial, serial))
      .limit(1);

    return batch ?? null;
  }
static async list(query: {
  page?: number;
  limit?: number;
  search?: string;
}) {

  return paginateQuery({
    db,
    query: db.query.productTable,
    countTable: productTable,

    page: query.page,
    limit: query.limit,
    search: query.search,
    searchColumns: [productTable.name],

    columns: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
      stock: true,
      salePrice: true,
      purchasePrice: true,
      status: true,
      featured: true,
      isPublished: true,
      inPosList: true,
      manageStock: true,
      manageWarranty: true,
      averageRating: true,
      totalReviews: true,
      totalSold: true,
      createdAt: true,
    },

    with: {
      brand: {
        columns: {
          id: true,
          name: true,
        },
      },
      unit: {
        columns: {
          id: true,
          name: true,
        },
      },
      category: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });
}





  static async variantList(query: { page?: number; limit?: number; search?: string }) {
    let searchCondition: SQL | undefined = undefined;

    if (query.search) {
      const searchTerm = `%${query.search}%`;

      // barcode দিয়ে variant এ search
      const barcodeCondition = ilike(variantTable.barcode, searchTerm);

      // product name দিয়ে product এ search (সাবকোয়েরি ব্যবহার করে)
      const productCondition = sql`${variantTable.productID} IN (
      SELECT id FROM ${productTable} WHERE ${ilike(productTable.name, searchTerm)}
    )`;

      searchCondition = or(barcodeCondition, productCondition);
    }

    return paginateQuery({
      db,
      query: db.query.variantTable,
      countTable: variantTable,
      page: query.page,
      limit: query.limit,
      where: searchCondition ? [searchCondition] : undefined,
      orderBy: desc(variantTable.updatedAt),
      with: {
        product: {
          columns: {
            id: true,
            name: true,
            thumbnail: true,
            manageStock:true,
            manageWarranty:true,
            decimal:true,
          },
          with: {
            brand: {
              columns: {
                name: true,
              },
            },
            unit: {
              columns: {
                name: true,
              },
            },
            category: {
              columns: {

                name: true,
              },
            },
          },
        },
      },
    });
  }

static async ecomProductList(query: EcomProductQuery) {

  const conditions: SQL[] = [];

  // ===================================
  // Search
  // ===================================
  if (query.search?.trim()) {
    const keyword = `%${query.search.trim()}%`;
    conditions.push(
      or(
        ilike(productTable.name, keyword),
        ilike(productTable.slug, keyword),
        ilike(productTable.sku, keyword)
      )!
    );
  }

  // ===================================
  // Category
  // ===================================
  if (query.categoryID?.length) {
    conditions.push(inArray(productTable.categoryID, query.categoryID));
  }

  // ===================================
  // Brand
  // ===================================
  if (query.brandID?.length) {
    conditions.push(inArray(productTable.brandID, query.brandID));
  }

  // ===================================
  // Unit
  // ===================================
  if (query.unitID?.length) {
    conditions.push(inArray(productTable.unitID, query.unitID));
  }

  // ===================================
  // Featured
  // ===================================
  if (query.featured !== undefined) {
    conditions.push(eq(productTable.featured, query.featured));
  }

  // ===================================
  // Published
  // ===================================
  if (query.published !== undefined) {
    conditions.push(eq(productTable.isPublished, query.published));
  }

  // ===================================
  // Stock
  // ===================================
  if (query.inStock) {
    conditions.push(gt(productTable.stock, 0));
  }

  // ===================================
  // Rating
  // ===================================
  if (query.minRating) {
    conditions.push(gte(productTable.averageRating, query.minRating));
  }

  // ===================================
  // Variant Price (filter এর জন্য এখনো variantTable লাগবে, কিন্তু response-এ আনবো না)
  // ===================================
  if (query.minPrice != null || query.maxPrice != null) {
    const variantConditions: SQL[] = [];

    if (query.minPrice != null) {
      variantConditions.push(gte(variantTable.salePrice, query.minPrice));
    }
    if (query.maxPrice != null) {
      variantConditions.push(lte(variantTable.salePrice, query.maxPrice));
    }

    conditions.push(
      sql`${productTable.id} IN (
        SELECT product_id
        FROM ${variantTable}
        WHERE ${and(...variantConditions)}
      )`
    );
  }

  // ===================================
  // Sort
  // ===================================
  let orderBy;

  switch (query.sort) {
    case "oldest":
      orderBy = asc(productTable.createdAt);
      break;
    case "priceAsc":
      orderBy = asc(productTable.salePrice);
      break;
    case "priceDesc":
      orderBy = desc(productTable.salePrice);
      break;
    case "nameAsc":
      orderBy = asc(productTable.name);
      break;
    case "nameDesc":
      orderBy = desc(productTable.name);
      break;
    case "bestSelling":
      orderBy = desc(productTable.totalSold);
      break;
    default:
      orderBy = desc(productTable.createdAt);
  }

  return paginateQuery({
    db,
    query: db.query.productTable,
    countTable: productTable,
    page: query.page,
    limit: query.limit,
    where: conditions,
    orderBy,

    // 👇 শুধু card-এ লাগবে এমন কলামগুলোই আসবে
    columns: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
      video: true,
      stock: true,
      totalSold: true,
      salePrice: true,
      manageStock: true,
      decimal: true,
      averageRating: true,
      totalReviews: true,
      shortDescription:true
    },
  });
}
  static async findSaleBatches(
    variantID: number,
    client: QueryClient = db,
  ): Promise<Batch[]> {
    return client
      .select()
      .from(batchTable)
      .where(
        and(
          eq(batchTable.variantID, variantID),
          isNull(batchTable.serial),
          gt(batchTable.remainingQty, 0),
        ),
      );
  }

  static async findSaleSerials(
    variantID: number,
    client: QueryClient = db,
  ): Promise<Batch[]> {
    return client
      .select()
      .from(batchTable)
      .where(
        and(
          eq(batchTable.variantID, variantID),
          eq(batchTable.isActive, true),
          isNotNull(batchTable.serial),
          gt(batchTable.remainingQty, 0),
        ),
      );
  }

  static async increaseProductStock(
    productID: number,
    qty: number,
    client: QueryClient = db,
  ): Promise<Product | null> {
    const [product] = await client
      .update(productTable)
      .set({
        stock: sql`${productTable.stock} + ${qty}`,
      })
      .where(eq(productTable.id, productID))
      .returning();

    return product ?? null;
  }
  static async decreaseProductStock(
    productID: number,
    qty: number,
    client: QueryClient = db,
  ): Promise<Product | null> {
    const [product] = await client
      .update(productTable)
      .set({
        stock: sql`${productTable.stock} - ${qty}`,
      })
      .where(eq(productTable.id, productID))
      .returning();

    return product ?? null;
  }

  static async increaseVariantStock(
    variantID: number,
    qty: number,
    client: QueryClient = db,
  ): Promise<Variant | null> {
    const [variant] = await client
      .update(variantTable)
      .set({
        stock: sql`${variantTable.stock} + ${qty}`,
      })
      .where(eq(variantTable.id, variantID))
      .returning();

    return variant ?? null;
  }
  static async decreaseVariantStock(
    variantID: number,
    qty: number,
    client: QueryClient = db,
  ): Promise<Variant | null> {
    const [variant] = await client
      .update(variantTable)
      .set({
        stock: sql`${variantTable.stock} - ${qty}`,
      })
      .where(eq(variantTable.id, variantID))
      .returning();

    return variant ?? null;
  }

  static async increaseBatchStock(
    batchID: number,
    qty: number,
    client: QueryClient = db,
  ): Promise<Batch | null> {
    const [batch] = await client
      .update(batchTable)
      .set({
        remainingQty: sql`${batchTable.remainingQty} + ${qty}`,
      })
      .where(eq(batchTable.id, batchID))
      .returning();

    return batch ?? null;
  }
  static async decreaseBatchStock(
    batchID: number,
    qty: number,
    client: QueryClient = db,
  ): Promise<Batch | null> {
    const [batch] = await client
      .update(batchTable)
      .set({
        remainingQty: sql`${batchTable.remainingQty} - ${qty}`,
      })
      .where(eq(batchTable.id, batchID))
      .returning();

    return batch ?? null;
  }

  static async updateProductFifoBatchAndStock(
    productID: number,
    options: {
      fifoBatchID?: number;
      qty?: number;
      salePrice?: number;
      purchasePrice?: number;
    },
    client: QueryClient = db,
  ): Promise<Product | null> {
    const update: Record<string, any> = {};

    if (options.fifoBatchID !== undefined) {
      update.fifoBatchID = options.fifoBatchID;
    }

    if (options.salePrice !== undefined) {
      update.salePrice = options.salePrice;
    }

    if (options.purchasePrice !== undefined) {
      update.purchasePrice = options.purchasePrice;
    }

    if (options.qty !== undefined) {
      update.stock = sql`${productTable.stock} + ${options.qty}`;
    }

    const [product] = await client
      .update(productTable)
      .set(update)
      .where(eq(productTable.id, productID))
      .returning();

    return product ?? null;
  }
  static async updateBatchDynamically(
    batchID: number,
    options: {
      set?: Partial<Batch>;
      inc?: Partial<Record<keyof Batch, number>>;
    },
    client: QueryClient = db,
  ): Promise<Batch | null> {
    const update: Record<string, any> = {
      ...(options.set ?? {}),
    };

    if (options.inc) {
      for (const [key, value] of Object.entries(options.inc)) {
        update[key] =
          sql`${batchTable[key as keyof typeof batchTable]} + ${value}`;
      }
    }

    const [batch] = await client
      .update(batchTable)
      .set(update)
      .where(eq(batchTable.id, batchID))
      .returning();

    return batch ?? null;
  }


  static async findBatches<K extends keyof Batch>(
    fieldName: K,
    fieldVal: Batch[K],
    client: QueryClient = db,
  ): Promise<Batch[]> {
    return client
      .select()
      .from(batchTable)
      .where(eq(batchTable[fieldName] as any, fieldVal as any))
      .orderBy(asc(batchTable.purchaseDate));
  }

  static async deleteBatches(batchIDs: number[], client: QueryClient = db) {
    return client.delete(batchTable).where(inArray(batchTable.id, batchIDs));
  }

  static async createStockFlow(
    payload: stockFlowPayload,
    client: QueryClient = db,
  ) {
    const [stockFlow] = await client
      .insert(stockFlowTable)
      .values(payload)
      .returning();

    return stockFlow ?? null;
  }

  static async findBatchesByVariantID(
    variantID: number,
    client: QueryClient = db,
  ) {
    return client
      .select()
      .from(batchTable)
      .where(
        and(
          eq(batchTable.variantID, variantID),
          isNull(batchTable.serial),
          gt(batchTable.remainingQty, 0),
        ),
      )
      .orderBy(asc(batchTable.purchaseDate));
  }

  static async findBatchesByPurchaseID(
    purchaseID: number,
    client: QueryClient = db,
  ) {
    return client
      .select()
      .from(batchTable)
      .where(eq(batchTable.purchaseID, purchaseID));
  }
  static async findStockFlowByPurchaseID(
    purchaseID: number,
    client: QueryClient = db,
  ) {
    return client
      .select()
      .from(stockFlowTable)
      .where(eq(stockFlowTable.purchaseID, purchaseID));
  }

  static async findStockFlowByBatchID(
    batchID: number,
    client: QueryClient = db,
  ) {
    return client
      .select()
      .from(stockFlowTable)
      .where(eq(stockFlowTable.batchID, batchID));
  }

  static async findStockFlowDynamically(
    batchID: number,
    column: StockFlowColumn,
    columnID: number,
    client: QueryClient = db,
  ) {
    return client
      .select()
      .from(stockFlowTable)
      .where(
        and(
          eq(stockFlowTable.batchID, batchID),
          eq(stockFlowTable[column], columnID),
        ),
      );
  }

  static async findVariantsByProductID(
    productID: number,
    client: QueryClient = db,
  ) {
    return client
      .select({
        id: variantTable.id,
        productID: variantTable.productID,
        salePrice: variantTable.salePrice,
        stock: variantTable.stock,
        barcode: variantTable.barcode,
        weight: variantTable.weight,
        attributes: variantTable.attributes,
        images: variantTable.images,
        imageFileIds: variantTable.imageFileIds,
        createdAt: variantTable.createdAt,
        updatedAt: variantTable.updatedAt,
      })
      .from(variantTable)
      .where(eq(variantTable.productID, productID))
      .orderBy(asc(variantTable.id));
  }

  static async getSaleProduct(
    variantID: number,
    client: QueryClient = db,
  ) {
    return client
      .select()
      .from(batchTable)
      .where(
        and(
          eq(batchTable.variantID, variantID),
          gt(batchTable.remainingQty, 0),
        ),
      );
  }

}
