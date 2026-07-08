import { QueryClient } from "../../../drizzle/src";
import { productTable, variantTable, batchTable, stockFlowTable } from "../product.table";
import { eq, and, gt, isNull, asc, desc, ilike, sql, or, inArray } from "drizzle-orm";
import db from "../../../drizzle/src";

export interface ProductFilters {
  search?: string;
  categoryID?: number;
  brandID?: number;
  status?: string;
  isPublished?: boolean;
  inPosList?: boolean;
  manageStock?: boolean;
  manageWarranty?: boolean;
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: ProductFilters;
}

export interface ProductWithRelations {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  brandID: number | null;
  unitID: number;
  categoryID: number | null;
  manageStock: boolean;
  manageWarranty: boolean;
  thumbnail: string | null;
  stock: number;
  salePrice: number;
  purchasePrice: number;
  isPublished: boolean;
  inPosList: boolean;
  status: string;
  featured: boolean;
  createdAt: Date;
  brand?: { id: number; name: string } | null;
  unit?: { id: number; name: string } | null;
  category?: { id: number; name: string } | null;
  variants?: Array<{
    id: number;
    salePrice: number;
    barcode: string | null;
    attributes: Array<{ name: string; value: string }>;
    stock: number;
  }>;
}

/**
 * Dynamic product query builder with relations
 */
export class ProductQueries {
  /**
   * Find products with dynamic filters and pagination
   */
  static async findProducts(query: ProductListQuery, tx?: QueryClient) {
    const { page = 1, limit = 10, search, sortBy = "createdAt", sortOrder = "desc", filters = {} } = query;
    const client = tx ?? db;

    // Build where conditions
    const conditions = [];

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          ilike(productTable.name, searchTerm),
          ilike(productTable.slug, searchTerm)
        )
      );
    }

    if (filters.categoryID) {
      conditions.push(eq(productTable.categoryID, filters.categoryID));
    }
    if (filters.brandID) {
      conditions.push(eq(productTable.brandID, filters.brandID));
    }
    if (filters.status) {
      conditions.push(eq(productTable.status, filters.status));
    }
    if (filters.isPublished !== undefined) {
      conditions.push(eq(productTable.isPublished, filters.isPublished));
    }
    if (filters.inPosList !== undefined) {
      conditions.push(eq(productTable.inPosList, filters.inPosList));
    }
    if (filters.manageStock !== undefined) {
      conditions.push(eq(productTable.manageStock, filters.manageStock));
    }
    if (filters.manageWarranty !== undefined) {
      conditions.push(eq(productTable.manageWarranty, filters.manageWarranty));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count total
    const [{ total }] = await client
      .select({ total: sql<number>`count(*)` })
      .from(productTable)
      .where(whereClause);

    // Build order by
    const orderByColumn = productTable[sortBy as keyof typeof productTable] || productTable.createdAt;
    const orderBy = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Fetch with relations
    const products = await client.query.productTable.findMany({
      where: whereClause,
      orderBy,
      limit,
      offset: (page - 1) * limit,
      with: {
        brand: { columns: { id: true, name: true } },
        unit: { columns: { id: true, name: true } },
        category: { columns: { id: true, name: true } },
        variants: {
          columns: {
            id: true,
            salePrice: true,
            barcode: true,
            attributes: true,
            stock: true,
          },
        },
      },
    });

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find product by ID with configurable relations
   */
  static async findById(
    id: number,
    relations: {
      brand?: boolean;
      unit?: boolean;
      category?: boolean;
      variants?: boolean;
      batches?: boolean;
    } = {},
    tx?: QueryClient
  ) {
    const client = tx ?? db;

    return client.query.productTable.findFirst({
      where: eq(productTable.id, id),
      with: {
        brand: relations.brand ?? true,
        unit: relations.unit ?? true,
        category: relations.category ?? true,
        variants: relations.variants ?? true,
        batches: relations.batches ?? false,
      },
    });
  }

  /**
   * Find product by barcode (for POS/sale)
   */
  static async findByBarcode(barcode: string, tx?: QueryClient) {
    const client = tx ?? db;

    const [variant] = await client
      .select({
        id: variantTable.id,
        productID: variantTable.productID,
        salePrice: variantTable.salePrice,
        barcode: variantTable.barcode,
        attributes: variantTable.attributes,
        stock: variantTable.stock,
        product: {
          id: productTable.id,
          name: productTable.name,
          slug: productTable.slug,
          manageStock: productTable.manageStock,
          manageWarranty: productTable.manageWarranty,
          thumbnail: productTable.thumbnail,
          stock: productTable.stock,
          salePrice: productTable.salePrice,
          status: productTable.status,
          brandID: productTable.brandID,
          unitID: productTable.unitID,
        },
      })
      .from(variantTable)
      .innerJoin(productTable, eq(variantTable.productID, productTable.id))
      .where(eq(variantTable.barcode, barcode))
      .limit(1);

    return variant ?? null;
  }

  /**
   * Count products with filters
   */
  static async count(filters: ProductFilters, tx?: QueryClient): Promise<number> {
    const client = tx ?? db;
    const conditions = [];

    if (filters.categoryID) conditions.push(eq(productTable.categoryID, filters.categoryID));
    if (filters.brandID) conditions.push(eq(productTable.brandID, filters.brandID));
    if (filters.status) conditions.push(eq(productTable.status, filters.status));
    if (filters.isPublished !== undefined) conditions.push(eq(productTable.isPublished, filters.isPublished));
    if (filters.inPosList !== undefined) conditions.push(eq(productTable.inPosList, filters.inPosList));
    if (filters.manageStock !== undefined) conditions.push(eq(productTable.manageStock, filters.manageStock));
    if (filters.manageWarranty !== undefined) conditions.push(eq(productTable.manageWarranty, filters.manageWarranty));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await client
      .select({ total: sql<number>`count(*)` })
      .from(productTable)
      .where(whereClause);

    return total;
  }

  /**
   * Get POS products (lightweight)
   */
  static async getPosProducts(query: { page?: number; limit?: number; search?: string } = {}, tx?: QueryClient) {
    const { page = 1, limit = 50, search } = query;
    const client = tx ?? db;

    const conditions = [eq(productTable.inPosList, true), eq(productTable.status, "active")];

    if (search) {
      conditions.push(ilike(productTable.name, `%${search}%`));
    }

    const products = await client
      .select({
        id: productTable.id,
        name: productTable.name,
        slug: productTable.slug,
        thumbnail: productTable.thumbnail,
        salePrice: productTable.salePrice,
        stock: productTable.stock,
        manageStock: productTable.manageStock,
        manageWarranty: productTable.manageWarranty,
        unitID: productTable.unitID,
        categoryID: productTable.categoryID,
        variant: {
          id: variantTable.id,
          salePrice: variantTable.salePrice,
          attributes: variantTable.attributes,
        },
      })
      .from(productTable)
      .leftJoin(variantTable, eq(variantTable.productID, productTable.id))
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(asc(productTable.name));

    return products;
  }

  /**
   * Toggle POS status
   */
  static async togglePosStatus(id: number, tx?: QueryClient) {
    const client = tx ?? db;

    const [product] = await client
      .select({ id: productTable.id, manageWarranty: productTable.manageWarranty, inPosList: productTable.inPosList })
      .from(productTable)
      .where(eq(productTable.id, id))
      .limit(1);

    if (!product) throw new Error("Product not found");
    if (product.manageWarranty) throw new Error("Warranty products cannot be added to POS");

    await client
      .update(productTable)
      .set({ inPosList: !product.inPosList })
      .where(eq(productTable.id, id));

    return { success: true, inPosList: !product.inPosList };
  }
}

export class VariantQueries {
  /**
   * Find variants with dynamic filters
   */
  static async findVariants(query: {
    page?: number;
    limit?: number;
    search?: string;
    productID?: number;
  } = {}, tx?: QueryClient) {
    const { page = 1, limit = 10, search, productID } = query;
    const client = tx ?? db;

    const conditions = [];

    if (productID) conditions.push(eq(variantTable.productID, productID));
    if (search) {
      const term = `%${search}%`;
      conditions.push(
        or(
          ilike(variantTable.barcode, term),
          sql`${variantTable.productID} IN (SELECT id FROM ${productTable} WHERE ${ilike(productTable.name, term)})`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await client
      .select({ total: sql<number>`count(*)` })
      .from(variantTable)
      .where(whereClause);

    const variants = await client.query.variantTable.findMany({
      where: whereClause,
      limit,
      offset: (page - 1) * limit,
      orderBy: asc(variantTable.id),
      with: {
        product: {
          columns: { id: true, name: true, thumbnail: true, manageStock: true, manageWarranty: true },
          with: {
            brand: { columns: { name: true } },
            unit: { columns: { name: true } },
            category: { columns: { name: true } },
          },
        },
      },
    });

    return { data: variants, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  static async findById(id: number, tx?: QueryClient) {
    const client = tx ?? db;
    return client.query.variantTable.findFirst({
      where: eq(variantTable.id, id),
      with: { product: true },
    });
  }
}

export class BatchQueries {
  /**
   * Get batches for variant (sale-ready, FIFO order)
   */
  static async getSaleBatches(variantID: number, tx?: QueryClient) {
    const client = tx ?? db;
    return client
      .select()
      .from(batchTable)
      .where(
        and(
          eq(batchTable.variantID, variantID),
          isNull(batchTable.serial),
          gt(batchTable.remainingQty, 0)
        )
      )
      .orderBy(asc(batchTable.purchaseDate));
  }

  /**
   * Get FIFO batches with row lock
   */
  static async getFifoBatches(variantID: number, tx?: QueryClient) {
    const client = tx ?? db;
    return client
      .select()
      .from(batchTable)
      .where(
        and(
          eq(batchTable.variantID, variantID),
          isNull(batchTable.serial),
          gt(batchTable.remainingQty, 0)
        )
      )
      .orderBy(asc(batchTable.purchaseDate))
      .for("update");
  }

  /**
   * Get serial batches for warranty products
   */
  static async getSerialBatches(productID: number, tx?: QueryClient) {
    const client = tx ?? db;
    return client
      .select()
      .from(batchTable)
      .where(
        and(
          eq(batchTable.productID, productID),
          eq(batchTable.isActive, true),
          isNotNull(batchTable.serial),
          gt(batchTable.remainingQty, 0)
        )
      );
  }

  /**
   * Find batch by serial
   */
  static async findBySerial(serial: string, tx?: QueryClient) {
    const client = tx ?? db;
    const [batch] = await client
      .select()
      .from(batchTable)
      .where(eq(batchTable.serial, serial))
      .limit(1);
    return batch ?? null;
  }

  /**
   * Get batches by purchase ID
   */
  static async getByPurchaseID(purchaseID: number, tx?: QueryClient) {
    const client = tx ?? db;
    return client
      .select()
      .from(batchTable)
      .where(eq(batchTable.purchaseID, purchaseID));
  }

  /**
   * Get batches by variant ID
   */
  static async getByVariantID(variantID: number, tx?: QueryClient) {
    const client = tx ?? db;
    return client
      .select()
      .from(batchTable)
      .where(eq(batchTable.variantID, variantID))
      .orderBy(asc(batchTable.purchaseDate));
  }
}

export class StockFlowQueries {
  /**
   * Find stock flow by reference
   */
  static async findByReference(
    batchID: number,
    column: "purchaseID" | "purchaseReturnID" | "saleID" | "saleReturnID",
    referenceID: number,
    tx?: QueryClient
  ) {
    const client = tx ?? db;
    return client
      .select()
      .from(stockFlowTable)
      .where(
        and(
          eq(stockFlowTable.batchID, batchID),
          eq(stockFlowTable[column], referenceID)
        )
      );
  }

  /**
   * Find stock flow dynamically
   */
  static async findDynamically(
    batchID: number,
    column: "purchaseID" | "purchaseReturnID" | "saleID" | "saleReturnID",
    referenceID: number,
    tx?: QueryClient
  ) {
    const client = tx ?? db;
    return client
      .select()
      .from(stockFlowTable)
      .where(
        and(
          eq(stockFlowTable.batchID, batchID),
          eq(stockFlowTable[column], referenceID)
        )
      );
  }
}