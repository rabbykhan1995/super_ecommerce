import { ClientSession, Types } from "mongoose";
import db, { QueryClient } from "../../drizzle/src";
import { saleTable } from "./sale.table";
import { paginateQuery } from "../../utils/queryBuilder";
import { OnlySalePayload, SaleItemPayload } from "./sale.type";
import { eq } from "drizzle-orm";
import { saleItemsTable } from "./sale_items.table";

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

    static async delete(
        saleID: number,
        client: QueryClient = db
    ) {
        const [sale] = await client
            .delete(saleTable)
            .where(eq(saleTable.id, saleID))
            .returning();

        return sale ?? null;
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
            with: {
                customer: {
                    columns: {
                        name: true,
                    },
                },
            }
        });
    }


    static async getSoldProductsBySaleID(
        saleID: number,
        client: QueryClient = db
    ) {
        return await client.query.saleItemsTable.findMany({
            where: eq(saleItemsTable.saleID, saleID),
            with: {
                product: {
                    columns: {
                        id: true,
                        name: true,
                    },
                    with: {
                        unit: {
                            columns: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                batch: {
                    columns: {
                        id: true,
                        serial: true,
                    },
                    with: {
                        variant: {
                            columns: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }

    static async createSaleItem(payload: SaleItemPayload, client: QueryClient = db) {
        const result = await client.insert(saleItemsTable).values(payload).returning();

        return result[0];
    }

    static async update(
        saleID: number,
        data: Partial<typeof saleTable.$inferInsert>,
        client: QueryClient = db
    ) {
        const [updated] = await client
            .update(saleTable)
            .set(data)
            .where(eq(saleTable.id, saleID))
            .returning();

        return updated;
    }
}