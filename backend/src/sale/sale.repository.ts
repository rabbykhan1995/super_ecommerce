import { ClientSession, Types } from "mongoose";
import Sale from "./sale.model";
import db, { QueryClient } from "../../drizzle/src";
import { saleTable } from "./sale.table";
import { paginateQuery } from "../../utils/queryBuilder";
import { OnlySalePayload } from "./sale.type";
import { eq } from "drizzle-orm";

export default class SaleRepository {
    static async getSaleByID(
        saleID: number,
        client: QueryClient = db
    ) {
        const [sale] = await client
            .select()
            .from(saleTable)
            .where(eq(saleTable.id, saleID))
            .limit(1);

        return sale;
    }

    static async create(payload: OnlySalePayload, client: QueryClient = db) {

        const result = await client.insert(saleTable).values(payload).returning();

        return result[0];
    }

    static async list(query: {
        page?: number;
        limit?: number;
        search?: string;
    }) {

        return paginateQuery({
            query: db.query.saleTable,
            countTable: saleTable,
            searchColumns: [saleTable.invoiceNo],
            page: query.page,
            limit: query.limit,
            search: query.search,
        });
    }

    static async findAndUpdateByID(
        id: string,
        update: Record<string, any>,
        session?: ClientSession
    ) {
        return Sale.findByIdAndUpdate(
            id,
            update,
            {
                new: true,
                ...(session ? { session } : {}),
            }
        );
    }
}