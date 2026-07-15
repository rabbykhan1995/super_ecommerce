import { QuotationStatus, SaleQuotationItemPayload, SaleQuotationPayload } from "./quotation.type";
import db, { QueryClient } from "../../drizzle/src";
import { saleQuotationItemsTable, saleQuotationTable } from "./quotation.table";
import { eq } from "drizzle-orm";
import { paginateQuery } from "../../utils/queryBuilder";

export default class QuotationRepository {
    static async createSaleQuotation(payload: SaleQuotationPayload, client: QueryClient = db) {
        const [saleQuotation] = await client.insert(saleQuotationTable).values(payload).returning();
        return saleQuotation;
    }

    static async createSaleQuotationItems(payload: SaleQuotationItemPayload[], client: QueryClient = db) {
        return await client.insert(saleQuotationItemsTable).values(payload);

    }

    static async updateStatusOfSaleQuotation(
        quoteID: number,
        status: QuotationStatus,
        client: QueryClient = db
    ) {
        const [saleQuotation] = await client
            .update(saleQuotationTable)
            .set({ status })
            .where(eq(saleQuotationTable.id, quoteID))
            .returning();

        return saleQuotation;
    }




    static async listOfSaleQuotation(query: {
        page?: number;
        limit?: number;
        search?: string;
    }) {
        return paginateQuery({
            query: db.query.saleQuotationTable,
            countTable: saleQuotationTable,
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
    static async getSaleQuotationByID(
        quoteID: number,
        client: QueryClient = db
    ) {
        const [saleQuotation] = await client.query.saleQuotationTable.findMany({
            where: eq(saleQuotationTable.id, quoteID),
            with: {
                items: true,
            },
        });

        return saleQuotation;

    }

    static async getQuotationItemsByID(
        quoteID: number,
        client: QueryClient = db
    ) {
        return await client.query.saleQuotationItemsTable.findMany({
            where: eq(saleQuotationItemsTable.quotationID, quoteID),
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

}