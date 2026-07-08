import { eq, and, gt, isNull, ne, isNotNull } from "drizzle-orm";
import { ApiError } from "../../../../utils/ApiError";
import db, {
QueryClient} from "../../../../drizzle/src";
import { productTable } from "../../product.table";
import { variantTable } from "../../variant.table";
import { batchTable } from "../../batch.table";

/**
 * Centralized validation helpers for product-related operations.
 * Used by Sale, Purchase, SaleReturn, PurchaseReturn modules.
 */

export interface ValidatedProduct {
  id: number;
  name: string;
  manageStock: boolean;
  manageWarranty: boolean;
  stock: number;
}

export interface ValidatedVariant {
  id: number;
  productID: number;
  attributes: Array<{ name: string; value: string }>;
}

export interface ValidatedBatch {
  id: number;
  productID: number;
  variantID: number;
  remainingQty: number;
  serial: string | null;
  soldQty: number;
  saleReturnedQty: number | null;
  purchaseID: number | null;
  cost: number;
  isActive: boolean;
}

export interface ProductVariantBatch {
  product: ValidatedProduct;
  variant: ValidatedVariant;
  batch: ValidatedBatch;
}

/**
 * Validates product exists and returns lean product data
 */
export async function validateProduct(
  productID: number,
  tx?: QueryClient,
  options?: { forUpdate?: boolean }
): Promise<ValidatedProduct> {
  const client = tx ?? db;
  const query = client
    .select({
      id: productTable.id,
      name: productTable.name,
      manageStock: productTable.manageStock,
      manageWarranty: productTable.manageWarranty,
      stock: productTable.stock,
    })
    .from(productTable)
    .where(eq(productTable.id, productID))
    .limit(1);

  if (options?.forUpdate) {
    query.for("update");
  }

  const [product] = await query;

  if (!product) {
    throw new ApiError(404, `Product not found: ${productID}`);
  }

  return product;
}

/**
 * Validates variant exists and belongs to product
 */
export async function validateVariant(
  variantID: number,
  expectedProductID?: number,
  tx?: QueryClient
): Promise<ValidatedVariant> {
  const client = tx ?? db;
  const [variant] = await client
    .select({
      id: variantTable.id,
      productID: variantTable.productID,
      attributes: variantTable.attributes,
    })
    .from(variantTable)
    .where(eq(variantTable.id, variantID))
    .limit(1);

  if (!variant) {
    throw new ApiError(404, `Variant not found: ${variantID}`);
  }

  if (expectedProductID && variant.productID !== expectedProductID) {
    throw new ApiError(400, `Variant ${variantID} does not belong to product ${expectedProductID}`);
  }

  return variant;
}

/**
 * Validates batch exists for sale (with row lock)
 */
export async function validateBatchForSale(
  batchID: number,
  expectedVariantID?: number,
  expectedProductID?: number,
  tx?: QueryClient
): Promise<ValidatedBatch> {
  const client = tx ?? db;
  const [batch] = await client
    .select({
      id: batchTable.id,
      productID: batchTable.productID,
      variantID: batchTable.variantID,
      remainingQty: batchTable.remainingQty,
      serial: batchTable.serial,
      soldQty: batchTable.soldQty,
      saleReturnedQty: batchTable.saleReturnedQty,
      purchaseID: batchTable.purchaseID,
      cost: batchTable.cost,
      isActive: batchTable.isActive,
    })
    .from(batchTable)
    .where(eq(batchTable.id, batchID))
    .for("update")
    .limit(1);

  if (!batch) {
    throw new ApiError(404, `Batch not found: ${batchID}`);
  }

  if (expectedVariantID && batch.variantID !== expectedVariantID) {
    throw new ApiError(400, `Batch ${batchID} does not belong to variant ${expectedVariantID}`);
  }

  if (expectedProductID && batch.productID !== expectedProductID) {
    throw new ApiError(400, `Batch ${batchID} does not belong to product ${expectedProductID}`);
  }

  if (!batch.isActive) {
    throw new ApiError(400, `Batch ${batchID} is not active`);
  }

  return batch;
}

/**
 * Validates batch exists for return (with row lock)
 */
export async function validateBatchForReturn(
  batchID: number,
  expectedVariantID?: number,
  expectedProductID?: number,
  tx?: QueryClient
): Promise<ValidatedBatch> {
  const batch = await validateBatchForSale(batchID, expectedVariantID, expectedProductID, tx);

  if (batch.remainingQty <= 0 && !batch.serial) {
    throw new ApiError(400, `Batch ${batchID} has no stock to return`);
  }

  return batch;
}

/**
 * Validates batch exists for purchase return
 */
export async function validateBatchForPurchaseReturn(
  batchID: number,
  expectedPurchaseID: number,
  expectedVariantID?: number,
  expectedProductID?: number,
  tx?: QueryClient
): Promise<ValidatedBatch> {
  const client = tx ?? db;
  const [batch] = await client
    .select({
      id: batchTable.id,
      productID: batchTable.productID,
      variantID: batchTable.variantID,
      remainingQty: batchTable.remainingQty,
      serial: batchTable.serial,
      purchasedQty: batchTable.purchasedQty,
      purchaseID: batchTable.purchaseID,
      cost: batchTable.cost,
      isActive: batchTable.isActive,
    })
    .from(batchTable)
    .where(
      and(
        eq(batchTable.id, batchID),
        eq(batchTable.purchaseID, expectedPurchaseID)
      )
    )
    .for("update")
    .limit(1);

  if (!batch) {
    throw new ApiError(404, `Batch not found: ${batchID} for purchase ${expectedPurchaseID}`);
  }

  if (expectedVariantID && batch.variantID !== expectedVariantID) {
    throw new ApiError(400, `Batch ${batchID} does not belong to variant ${expectedVariantID}`);
  }

  if (expectedProductID && batch.productID !== expectedProductID) {
    throw new ApiError(400, `Batch ${batchID} does not belong to product ${expectedProductID}`);
  }

  return batch;
}

/**
 * Validates sufficient stock for sale
 */
export function validateStockSufficiency(
  batch: ValidatedBatch,
  requestedQty: number,
  productName: string
): void {
  if (batch.remainingQty < requestedQty) {
    throw new ApiError(
      400,
      `Insufficient stock for ${productName}. Available: ${batch.remainingQty}, Requested: ${requestedQty}`
    );
  }
}

/**
 * Validates return quantity doesn't exceed sold quantity
 */
export function validateReturnQuantity(
  batch: ValidatedBatch,
  returnQty: number,
  productName: string
): void {
  const alreadyReturned = batch.saleReturnedQty ?? 0;
  const maxReturnable = batch.soldQty - alreadyReturned;

  if (returnQty > maxReturnable) {
    throw new ApiError(
      400,
      `Max returnable qty for ${productName} is ${maxReturnable} (sold: ${batch.soldQty}, already returned: ${alreadyReturned})`
    );
  }
}

/**
 * Validates purchase return quantity
 */
export function validatePurchaseReturnQuantity(
  batch: ValidatedBatch,
  returnQty: number,
  productName: string
): void {
  // For purchase return, check against purchasedQty minus already returned
  // This would need stock flow check in real implementation
  if (returnQty > batch.purchasedQty) {
    throw new ApiError(
      400,
      `Return qty ${returnQty} exceeds purchased qty ${batch.purchasedQty} for ${productName}`
    );
  }
}

/**
 * Fetches and validates product + variant + batch in one call (for sale)
 */
export async function getProductVariantBatchForSale(
  productID: number,
  variantID: number,
  batchID: number,
  tx?: QueryClient
): Promise<ProductVariantBatch> {
  const [product, variant, batch] = await Promise.all([
    validateProduct(productID, tx),
    validateVariant(variantID, productID, tx),
    validateBatchForSale(batchID, variantID, productID, tx),
  ]);

  return { product, variant, batch };
}

/**
 * Fetches and validates product + variant + batch in one call (for sale return)
 */
export async function getProductVariantBatchForSaleReturn(
  productID: number,
  variantID: number,
  batchID: number,
  tx?: QueryClient
): Promise<ProductVariantBatch> {
  const [product, variant, batch] = await Promise.all([
    validateProduct(productID, tx),
    validateVariant(variantID, productID, tx),
    validateBatchForReturn(batchID, variantID, productID, tx),
  ]);

  return { product, variant, batch };
}

/**
 * Fetches and validates product + variant + batch for purchase return
 */
export async function getProductVariantBatchForPurchaseReturn(
  productID: number,
  variantID: number,
  batchID: number,
  purchaseID: number,
  tx?: QueryClient
): Promise<ProductVariantBatch> {
  const [product, variant, batch] = await Promise.all([
    validateProduct(productID, tx),
    validateVariant(variantID, productID, tx),
    validateBatchForPurchaseReturn(batchID, purchaseID, variantID, productID, tx),
  ]);

  return { product, variant, batch };
}

/**
 * Fetches and validates product + variant for FIFO sale
 */
export async function getProductVariantForFifoSale(
  productID: number,
  variantID: number,
  tx?: QueryClient
): Promise<{ product: ValidatedProduct; variant: ValidatedVariant }> {
  const [product, variant] = await Promise.all([
    validateProduct(productID, tx),
    validateVariant(variantID, productID, tx),
  ]);

  if (product.manageWarranty) {
    throw new ApiError(400, `Warranty product ${product.name} cannot use FIFO sale`);
  }

  return { product, variant };
}