import { OnlyPurchasePayload, Purchase } from "./purchase.type";
import { paginateQuery } from "../../utils/queryBuilder";
import { purchaseTable } from "./purchase.table";
import { and, eq } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";

export default class PurchaseRepository {
    static async purchaseCreate(
        payload: OnlyPurchasePayload,
        client: QueryClient = db
    ): Promise<Purchase> {

        const [purchase] = await client.insert(purchaseTable).values(payload).returning();

        return purchase;
    }

    static async findByID(
        purchaseID: number,
        client: QueryClient = db
    ): Promise<Purchase> {
        const [purchase] = await client
            .select()
            .from(purchaseTable)
            .where(and(eq(purchaseTable.id, purchaseID), eq(purchaseTable.isDeleted, false)))
            .limit(1);

        return purchase
    }

    static async findByIDRaw(
        purchaseID: number,
        client: QueryClient = db
    ): Promise<Purchase> {
        const [purchase] = await client
            .select()
            .from(purchaseTable)
            .where(eq(purchaseTable.id, purchaseID))
            .limit(1);

        return purchase
    }

    static async softDelete(purchaseID: number, client: QueryClient = db) {
        const [purchase] = await client
            .update(purchaseTable)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where(eq(purchaseTable.id, purchaseID))
            .returning();

        return purchase ?? null;
    }

    static async restore(purchaseID: number, client: QueryClient = db) {
        const [purchase] = await client
            .update(purchaseTable)
            .set({ isDeleted: false, deletedAt: null })
            .where(eq(purchaseTable.id, purchaseID))
            .returning();

        return purchase ?? null;
    }

    static async list(query: {
        page?: number;
        limit?: number;
        search?: string;
    }) {

        return paginateQuery({
            query: db.query.purchaseTable,
            countTable: purchaseTable,
            searchColumns: [purchaseTable.invoiceNo],
            where: [eq(purchaseTable.isDeleted, false)],
            page: query.page,
            limit: query.limit,
            search: query.search,
            with: {
                supplier: {
                    columns: {
                        name: true,
                    },
                },
            }
        });
    }
    static async purchaseInvoiceByID(
        purchaseID: number,
        client: QueryClient = db
    ) {
        const purchase = await client.query.purchaseTable.findFirst({
            where: and(eq(purchaseTable.id, purchaseID), eq(purchaseTable.isDeleted, false)),
            with: {
                transactions: true,
                supplier: true,
                batches: {
                    with: {
                        product: {
                            columns: {
                                name: true,
                            },
                            with: {
                                category: true,
                                brand: true,
                                unit: true,

                            },
                        },
                        variant: {
                            columns: {
                                attributes: true,
                            },
                        },
                    },
                },
            },
        });

        return purchase;
    }


    static async purchaseForReturnByID(
        purchaseID: number,
        client: QueryClient = db
    ) {
        const purchase = await client.query.purchaseTable.findFirst({
            where: and(eq(purchaseTable.id, purchaseID), eq(purchaseTable.isDeleted, false)),
            with: {
                transactions: true,
                supplier: true,
                batches: {
                    with: {
                        product: {
                            columns: {
                                name: true,
                            },
                            with: {
                                category: true,
                                brand: true,
                                unit: true,

                            },
                        },
                        variant: {
                            columns: {
                                attributes: true,
                            },
                        },
                        stockFlows:true
                    },
                },
            },
        });

        return purchase;
    }
    static async purchaseUpdateDynamic(
        purchaseID: number,
        data: Partial<typeof purchaseTable.$inferInsert>,
        client: QueryClient = db
    ) {
        const [updated] = await client
            .update(purchaseTable)
            .set(data)
            .where(eq(purchaseTable.id, purchaseID))
            .returning();

        return updated;
    }
}