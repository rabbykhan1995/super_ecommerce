import { Batch, BatchPayload, Product, ProductPayload, stockFlowPayload, UpdateProductInput, Variant, VariantPayload } from "./product.type";
import { productTable } from "./product.table";
import db, { QueryClient } from "../../drizzle/src";
import { and, asc, eq, gt, inArray, isNotNull, isNull, ne, sql } from "drizzle-orm";
import { batchTable } from "./batch.table";
import { paginateQuery } from "../../utils/queryBuilder";
import { variantTable } from "./variant.table";
import { stockFlowTable } from "./stock_flow.table";


export default class ProductRepository {
    static async findByField<
        K extends keyof Product
    >(
        fieldName: K,
        fieldVal: Product[K]
    ) {
        const [product] = await db
            .select()
            .from(productTable)
            .where(eq(productTable[fieldName] as any, fieldVal as any))

        return product ?? null;
    }

    static async findByFieldExceptId<
        K extends keyof Product
    >(
        fieldName: K,
        fieldVal: Product[K],
        excludeId: number
    ) {
        const [product] = await db
            .select()
            .from(productTable)
            .where(
                and(
                    eq(productTable[fieldName] as any, fieldVal as any),
                    ne(productTable.id, excludeId)
                )
            );

        return product ?? null;
    }

    static async findManyByField<
        K extends keyof Product
    >(
        fieldName: K,
        fieldVal: Product[K]
    ): Promise<Product[]> {
        return db
            .select()
            .from(productTable)
            .where(eq(productTable[fieldName] as any, fieldVal as any));
    }
    static async findByID(
        productID: number,
        client: QueryClient = db
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
        client: QueryClient = db
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
        client: QueryClient = db
    ): Promise<Batch | null> {
        const [batch] = await client
            .select()
            .from(batchTable)
            .where(eq(batchTable.id, batchID))
            .for("update")
            .limit(1);

        return batch ?? null;
    }

    static async findOneBatch<
        K extends keyof Batch
    >(
        fieldName: K,
        fieldVal: Batch[K],
        client: QueryClient = db
    ): Promise<Batch | null> {
        const [batch] = await client
            .select()
            .from(batchTable)
            .where(eq(batchTable[fieldName] as any, fieldVal as any))
            .orderBy(asc(batchTable.purchaseDate))
            .limit(1);

        return batch ?? null;
    }
    static async createProduct(
        payload: ProductPayload,
        client: QueryClient = db
    ): Promise<Product | null> {
        const [product] = await client
            .insert(productTable)
            .values(payload)
            .returning();

        return product ?? null;
    }


    static async createVariant(
        payload: VariantPayload,
        client: QueryClient = db
    ): Promise<Variant | null> {
        const [variant] = await client
            .insert(variantTable)
            .values(payload)
            .returning();

        return variant ?? null;
    }

    static async createBatch(
        payload: BatchPayload,
        client: QueryClient = db
    ): Promise<Batch | null> {
        const [batch] = await client
            .insert(batchTable)
            .values(payload)
            .returning();

        return batch ?? null;
    }

    static async findVariantByBarcode(
        barcode: string,
        client: QueryClient = db
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
        client: QueryClient = db
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
        client: QueryClient = db
    ): Promise<Variant | null> {
        const [variant] = await client
            .select()
            .from(variantTable)
            .where(
                and(
                    eq(variantTable.barcode, barcode),
                    ne(variantTable.id, variantID)
                )
            )
            .limit(1);

        return variant ?? null;
    }

    static async updateProduct(
        productID: number,
        payload: UpdateProductInput,
        client: QueryClient = db
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
        client: QueryClient = db
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
        client: QueryClient = db
    ) {
        return client.query.productTable.findFirst({
            where: eq(productTable.id, productID),
            with: {
                brand: true,
                unit: true,
                category: true,
            },
        });
    }

    static async batchByProductID(
        productID: number,
        client: QueryClient = db
    ): Promise<Batch[]> {
        return client
            .select()
            .from(batchTable)
            .where(
                and(
                    eq(batchTable.productID, productID),
                    eq(batchTable.isActive, true),
                    gt(batchTable.remainingQty, 0)
                )
            )
            .orderBy(asc(batchTable.purchaseDate));
    }

    static async serialByProductID(
        productID: number,
        client: QueryClient = db
    ): Promise<Batch[]> {
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

    static async findBatchBySerial(
        serial: string,
        client: QueryClient = db
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

            searchColumns: [
                productTable.name,
            ],

            with: {
                brand: true,
                unit: true,
                category: true,
            },
        });
    }
    static async findSaleBatches(
        productID: number,
        variantID: number,
        client: QueryClient = db
    ): Promise<Batch[]> {
        return client
            .select()
            .from(batchTable)
            .where(
                and(
                    eq(batchTable.productID, productID),
                    eq(batchTable.variantID, variantID),
                    isNull(batchTable.serial),
                    gt(batchTable.remainingQty, 0)
                )
            );
    }

    // static async findSaleReturnBatches(
    //     batchIDs: SaleProduct[],
    //     sale: Sale
    // ) {
    //     const ids = batchIDs.map(x => x.batchID);

    //     const batches = await db.query.batchTable.findMany({
    //         where: and(
    //             inArray(batchTable.id, ids)
    //         ),
    //         with: {
    //             product: {
    //                 with: {
    //                     unit: true,
    //                     brand: true,
    //                     category: true,
    //                 },
    //             },
    //         },
    //     });

    //     return batches.map((batch) => {
    //         const soldInfo = sale.products.find(
    //             (p) => p.batchID === batch.id
    //         );

    //         return {
    //             id: batch.id,
    //             name: batch.product.name,
    //             unitName: batch.product.unit?.name,
    //             brandName: batch.product.brand?.name,
    //             categoryName: batch.product.category?.name,
    //             salePrice: soldInfo?.salePrice ?? 0,
    //             saleReturnedQty: batch.saleReturnedQty,
    //             soldQty: soldInfo?.soldQty ?? 0,
    //             remainingQty: batch.remainingQty,
    //             purchasedQty: batch.purchasedQty,
    //             warranty: batch.warranty,
    //             manageWarranty: (batch.warranty ?? 0) > 0,
    //             serial: batch.serial,
    //         };
    //     });
    // }

    static async findSaleSerials(
        productID: number,
        client: QueryClient = db
    ): Promise<Batch[]> {
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

    static async increaseProductStock(
        productID: number,
        qty: number,
        client: QueryClient = db
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
        client: QueryClient = db
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
        client: QueryClient = db
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
        client: QueryClient = db
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
        client: QueryClient = db
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
        client: QueryClient = db
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
        client: QueryClient = db
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
        client: QueryClient = db
    ): Promise<Batch | null> {
        const update: Record<string, any> = {
            ...(options.set ?? {}),
        };

        if (options.inc) {
            for (const [key, value] of Object.entries(options.inc)) {
                update[key] = sql`${batchTable[key as keyof typeof batchTable]} + ${value}`;
            }
        }

        const [batch] = await client
            .update(batchTable)
            .set(update)
            .where(eq(batchTable.id, batchID))
            .returning();

        return batch ?? null;
    }

    // static async deductStockFromBatch(
    //     batchID: number,
    //     qty: number,
    //     client: QueryClient = db
    // ): Promise<Batch | null> {
    //     const [batch] = await client
    //         .update(batchTable)
    //         .set({
    //             remainingQty: sql`${batchTable.remainingQty} - ${qty}`,
    //             soldQty: sql`${batchTable.soldQty} + ${qty}`,
    //         })
    //         .where(eq(batchTable.id, batchID))
    //         .returning();

    //     return batch ?? null;
    // }

    // static async returnStockToBatch(
    //     batchID: number,
    //     qty: number,
    //     client: QueryClient = db
    // ): Promise<Batch | null> {
    //     const [batch] = await client
    //         .update(batchTable)
    //         .set({
    //             remainingQty: sql`${batchTable.remainingQty} + ${qty}`,
    //             soldQty: sql`${batchTable.soldQty} - ${qty}`,
    //             isActive: true,
    //         })
    //         .where(eq(batchTable.id, batchID))
    //         .returning();

    //     return batch ?? null;
    // }

    static async findBatches<
        K extends keyof Batch
    >(
        fieldName: K,
        fieldVal: Batch[K],
        client: QueryClient = db
    ): Promise<Batch[]> {
        return client
            .select()
            .from(batchTable)
            .where(eq(batchTable[fieldName] as any, fieldVal as any))
            .orderBy(asc(batchTable.purchaseDate));
    }

    static async deleteBatches(
        batchIDs: number[],
        client: QueryClient = db
    ) {
        return client
            .delete(batchTable)
            .where(inArray(batchTable.id, batchIDs));
    }


    static async createStockFlow(payload: stockFlowPayload, client: QueryClient = db) {
        const [stockFlow] = await client
            .insert(stockFlowTable)
            .values(payload)
            .returning();

        return stockFlow ?? null;
    }


    static async findBatchesByVariantID(variantID: number, client: QueryClient = db) {
        return client
            .select()
            .from(batchTable)
            .where(
                and(
                    eq(batchTable.variantID, variantID),
                    isNull(batchTable.serial),
                    gt(batchTable.remainingQty, 0)

                )
            ).orderBy(asc(batchTable.purchaseDate));
    }

}

