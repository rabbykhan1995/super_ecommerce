import { OnlyPurchaseReturnPayload, PurchaseReturn } from "./purchase_return.type";
import { paginateQuery } from "../../utils/queryBuilder";
import { purchaseReturnTable } from "./purchase_return.table";
import { eq } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";

export default class PurchaseReturnRepository {
    static async purchaseReturnCreate(
        payload: OnlyPurchaseReturnPayload,
        client: QueryClient = db
    ): Promise<PurchaseReturn> {

        const [purchase] = await client.insert(purchaseReturnTable).values(payload).returning();

        return purchase;
    }

    static async findByID(
        purchaseID: number,
        client: QueryClient = db
    ): Promise<PurchaseReturn> {
        const [purchaseReturn] = await client
            .select()
            .from(purchaseReturnTable)
            .where(eq(purchaseReturnTable.id, purchaseID))
            .limit(1);

        return purchaseReturn
    }

    static async deletePurchaseReturnByID(purchaseID: number, client: QueryClient = db) {
        const deleted = await client.delete(purchaseReturnTable).where(eq(purchaseReturnTable.id, purchaseID))

        return deleted;

    }

    static async list(query: {
        page?: number;
        limit?: number;
        search?: string;
    }) {

        return paginateQuery({
            query: db.query.purchaseReturnTable,
            countTable: purchaseReturnTable,
            page: query.page,
            limit: query.limit,
            search: query.search,
        });
    }

    static async purchaseReturnUpdateDynamic(
        purchaseID: number,
        data: Partial<typeof purchaseReturnTable.$inferInsert>,
        client: QueryClient = db
    ) {
        const [updated] = await client
            .update(purchaseReturnTable)
            .set(data)
            .where(eq(purchaseReturnTable.id, purchaseID))
            .returning();

        return updated;
    }
}