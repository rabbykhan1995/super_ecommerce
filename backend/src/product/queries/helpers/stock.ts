
// import { productTable, variantTable, batchTable, stockFlowTable } from "../product.table";
import { eq, and, gt, isNull, asc, sql, inArray } from "drizzle-orm";
import db, {QueryClient} from "../../../../drizzle/src";
import { productTable } from "../../product.table";
import { variantTable } from "../../variant.table";
import { batchTable } from "../../batch.table";
import { stockFlowTable } from "../../stock_flow.table";
import { ApiError } from "../../../../utils/ApiError";


/**
 * Centralized stock adjustment and FIFO allocation helpers.
 * Single source of truth for all stock operations across modules.
 */

export interface StockAdjustmentParams {
  productID: number;
  variantID: number;
  batchID: number;
  qty: number;
  operation: "increase" | "decrease";
  tx?: QueryClient;
}

export interface StockFlowParams {
  productID: number;
  variantID: number;
  batchID: number;
  type: "in" | "out";
  referenceType: "sale" | "purchase" | "sale_return" | "purchase_return";
  referenceID: number;
  qty: number;
  beforeQty: number;
  afterQty: number;
  tx?: QueryClient;
}

export interface FifoAllocation {
  batchID: number;
  qty: number;
  costPrice: number;
  beforeQty: number;
  afterQty: number;
}

export interface FifoAllocationParams {
  variantID: number;
  requiredQty: number;
  tx?: QueryClient;
}

/**
 * Unified stock adjustment - replaces 6 duplicate calls across modules
 * Handles product, variant, and batch stock in single atomic operation
 */
export async function adjustStock(params: StockAdjustmentParams): Promise<void> {
  const { productID, variantID, batchID, qty, operation, tx } = params;
  const client = tx ?? db;

  if (operation === "decrease") {
    // For decrease, validate batch has sufficient stock first
    const [batch] = await client
      .select({ remainingQty: batchTable.remainingQty })
      .from(batchTable)
      .where(eq(batchTable.id, batchID))
      .for("update")
      .limit(1);

    if (!batch) {
      throw new ApiError(404, `Batch not found: ${batchID}`);
    }

    if (batch.remainingQty < qty) {
      const [product] = await client
        .select({ name: productTable.name })
        .from(productTable)
        .where(eq(productTable.id, productID))
        .limit(1);

      throw new ApiError(
        400,
        `Insufficient stock for ${product?.name || "product"}. Available: ${batch.remainingQty}, Requested: ${qty}`
      );
    }
  }

  const operations = operation === "increase"
    ? [
        client.update(productTable)
          .set({ stock: sql`${productTable.stock} + ${qty}` })
          .where(eq(productTable.id, productID)),
        client.update(variantTable)
          .set({ stock: sql`${variantTable.stock} + ${qty}` })
          .where(eq(variantTable.id, variantID)),
        client.update(batchTable)
          .set({ remainingQty: sql`${batchTable.remainingQty} + ${qty}` })
          .where(eq(batchTable.id, batchID)),
      ]
    : [
        client.update(productTable)
          .set({ stock: sql`${productTable.stock} - ${qty}` })
          .where(eq(productTable.id, productID)),
        client.update(variantTable)
          .set({ stock: sql`${variantTable.stock} - ${qty}` })
          .where(eq(variantTable.id, variantID)),
        client.update(batchTable)
          .set({ remainingQty: sql`${batchTable.remainingQty} - ${qty}` })
          .where(eq(batchTable.id, batchID)),
      ];

  await Promise.all(operations.map(op => op.execute()));
}

/**
 * Unified stock flow creation - replaces 4 duplicate blocks
 */
export async function recordStockFlow(params: StockFlowParams): Promise<void> {
  const { productID, variantID, batchID, type, referenceType, referenceID, qty, beforeQty, afterQty, tx } = params;
  const client = tx ?? db;

  const referenceColumn = {
    sale: "saleID",
    purchase: "purchaseID",
    sale_return: "saleReturnID",
    purchase_return: "purchaseReturnID",
  }[referenceType];

  await client.insert(stockFlowTable).values({
    productID,
    variantID,
    batchID,
    type,
    [referenceColumn]: referenceID,
    qty,
    beforeQty,
    afterQty,
  });
}

/**
 * FIFO allocation logic - single implementation for all FIFO sales
 * Returns ordered allocations from oldest batches
 */
export async function allocateFifoStock(params: FifoAllocationParams): Promise<FifoAllocation[]> {
  const { variantID, requiredQty, tx } = params;
  const client = tx ?? db;

  // Get FIFO batches (oldest first, with stock)
  const batches = await client
    .select({
      id: batchTable.id,
      remainingQty: batchTable.remainingQty,
      cost: batchTable.cost,
    })
    .from(batchTable)
    .where(
      and(
        eq(batchTable.variantID, variantID),
        gt(batchTable.remainingQty, 0),
        isNull(batchTable.serial) // Serial batches handled separately
      )
    )
    .orderBy(asc(batchTable.purchaseDate))
    .for("update");

  if (batches.length === 0) {
    throw new ApiError(400, "No stock available for FIFO allocation");
  }

  let remainingQty = requiredQty;
  const allocations: FifoAllocation[] = [];

  for (const batch of batches) {
    if (remainingQty <= 0) break;

    const available = batch.remainingQty;
    if (available <= 0) continue;

    const qty = Math.min(available, remainingQty);

    allocations.push({
      batchID: batch.id,
      qty,
      costPrice: batch.cost,
      beforeQty: batch.remainingQty,
      afterQty: batch.remainingQty - qty,
    });

    remainingQty -= qty;
  }

  if (remainingQty > 0) {
    throw new ApiError(400, `Insufficient stock. Short by ${remainingQty} units`);
  }

  return allocations;
}

/**
 * Serial batch allocation for warranty products
 */
export async function allocateSerialStock(params: {
  variantID: number;
  requiredQty: number;
  tx?: QueryClient;
}): Promise<FifoAllocation[]> {
  const { variantID, requiredQty, tx } = params;
  const client = tx ?? db;

  const batches = await client
    .select({
      id: batchTable.id,
      remainingQty: batchTable.remainingQty,
      cost: batchTable.cost,
      serial: batchTable.serial,
    })
    .from(batchTable)
    .where(
      and(
        eq(batchTable.variantID, variantID),
        gt(batchTable.remainingQty, 0),
        isNotNull(batchTable.serial)
      )
    )
    .orderBy(asc(batchTable.purchaseDate))
    .for("update");

  if (batches.length === 0) {
    throw new ApiError(400, "No serial stock available");
  }

  let remainingQty = requiredQty;
  const allocations: FifoAllocation[] = [];

  for (const batch of batches) {
    if (remainingQty <= 0) break;
    if (batch.remainingQty <= 0) continue;

    const qty = Math.min(batch.remainingQty, remainingQty);

    allocations.push({
      batchID: batch.id,
      qty,
      costPrice: batch.cost,
      beforeQty: batch.remainingQty,
      afterQty: batch.remainingQty - qty,
    });

    remainingQty -= qty;
  }

  if (remainingQty > 0) {
    throw new ApiError(400, `Insufficient serial stock. Short by ${remainingQty} units`);
  }

  return allocations;
}

/**
 * Batch stock update with dynamic fields
 */
export async function updateBatchDynamically(
  batchID: number,
  options: {
    set?: Record<string, any>;
    inc?: Record<string, number>;
  },
  tx?: QueryClient
): Promise<void> {
  const client = tx ?? db;
  const update: Record<string, any> = { ...(options.set ?? {}) };

  if (options.inc) {
    for (const [key, value] of Object.entries(options.inc)) {
      update[key] = sql`${batchTable[key as keyof typeof batchTable]} + ${value}`;
    }
  }

  await client
    .update(batchTable)
    .set(update)
    .where(eq(batchTable.id, batchID))
    .execute();
}

/**
 * Update product FIFO batch and stock
 */
export async function updateProductFifoAndStock(
  productID: number,
  options: {
    fifoBatchID?: number;
    qty?: number;
    salePrice?: number;
    purchasePrice?: number;
  },
  tx?: QueryClient
): Promise<void> {
  const client = tx ?? db;
  const update: Record<string, any> = {};

  if (options.fifoBatchID !== undefined) update.fifoBatchID = options.fifoBatchID;
  if (options.salePrice !== undefined) update.salePrice = options.salePrice;
  if (options.purchasePrice !== undefined) update.purchasePrice = options.purchasePrice;
  if (options.qty !== undefined) update.stock = sql`${productTable.stock} + ${options.qty}`;

  if (Object.keys(update).length > 0) {
    await client
      .update(productTable)
      .set(update)
      .where(eq(productTable.id, productID))
      .execute();
  }
}

/**
 * Find batches by variant with stock (for sale return)
 */
export async function findBatchesByVariantWithStock(
  variantID: number,
  tx?: QueryClient
): Promise<Array<{ id: number; remainingQty: number; salePrice: number; soldQty: number; saleReturnedQty: number | null }>> {
  const client = tx ?? db;
  return client
    .select({
      id: batchTable.id,
      remainingQty: batchTable.remainingQty,
      salePrice: batchTable.salePrice,
      soldQty: batchTable.soldQty,
      saleReturnedQty: batchTable.saleReturnedQty,
    })
    .from(batchTable)
    .where(
      and(
        eq(batchTable.variantID, variantID),
        gt(batchTable.remainingQty, 0)
      )
    )
    .orderBy(asc(batchTable.purchaseDate));
}

/**
 * Find batch by ID with full details
 */
export async function findBatchByID(
  batchID: number,
  tx?: QueryClient
): Promise<any> {
  const client = tx ?? db;
  const [batch] = await client
    .select()
    .from(batchTable)
    .where(eq(batchTable.id, batchID))
    .limit(1);
  return batch ?? null;
}

/**
 * Delete batches
 */
export async function deleteBatches(batchIDs: number[], tx?: QueryClient): Promise<void> {
  const client = tx ?? db;
  await client.delete(batchTable).where(inArray(batchTable.id, batchIDs));
}

/**
 * Create stock flow (batch-level)
 */
export async function createBatchStockFlow(
  payload: {
    batchID: number;
    productID: number;
    variantID: number;
    type: "in" | "out";
    referenceType: "sale" | "purchase" | "sale_return" | "purchase_return";
    referenceID: number;
    qty: number;
    beforeQty: number;
    afterQty: number;
  },
  tx?: QueryClient
): Promise<void> {
  const client = tx ?? db;
  await recordStockFlow(payload);
}

/**
 * Get FIFO batch for POS/simple sale
 */
export async function getFifoBatch(variantID: number, tx?: QueryClient): Promise<any> {
  const client = tx ?? db;
  const [batch] = await client
    .select()
    .from(batchTable)
    .where(
      and(
        eq(batchTable.variantID, variantID),
        gt(batchTable.remainingQty, 0),
        isNull(batchTable.serial)
      )
    )
    .orderBy(asc(batchTable.purchaseDate))
    .limit(1);
  return batch ?? null;
}