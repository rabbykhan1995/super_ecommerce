import db, { QueryClient } from "../../drizzle/src";
import { warrantyTable } from "./warranty.table";
import { WarrantyPayload, WarrantyResponse } from "./warranty.type";
import { and, eq } from "drizzle-orm";
import { paginateQuery } from "../../utils/queryBuilder";

export default class WarrantyRepository {
    static async create(payload: WarrantyPayload, client: QueryClient = db) {
        const [warranty] = await client
            .insert(warrantyTable)
            .values(payload)
            .returning();
        return warranty ?? null;
    }

    static async createMany(payloads: WarrantyPayload[], client: QueryClient = db) {
        return await client
            .insert(warrantyTable)
            .values(payloads)
            .returning();
    }

    static async findByID(id: number, client: QueryClient = db): Promise<WarrantyResponse | null> {
        const [warranty] = await client
            .select()
            .from(warrantyTable)
            .where(and(eq(warrantyTable.id, id), eq(warrantyTable.isDeleted, false)))
            .limit(1);
        return warranty ?? null;
    }

    static async findBySaleID(saleID: number, client: QueryClient = db) {
        return await client
            .select()
            .from(warrantyTable)
            .where(and(eq(warrantyTable.saleID, saleID), eq(warrantyTable.isDeleted, false)));
    }

    static async updateByID(id: number, payload: Partial<WarrantyPayload>, client: QueryClient = db) {
        const [warranty] = await client
            .update(warrantyTable)
            .set(payload)
            .where(eq(warrantyTable.id, id))
            .returning();
        return warranty ?? null;
    }

    static async deleteByID(id: number, client: QueryClient = db) {
        const [warranty] = await client
            .update(warrantyTable)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where(eq(warrantyTable.id, id))
            .returning();
        return warranty ?? null;
    }

    static async deleteManyBySaleID(saleID: number, client: QueryClient = db) {
        return await client
            .update(warrantyTable)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where(eq(warrantyTable.saleID, saleID))
            .returning();
    }

    static async deleteBySerial(serial: string, client: QueryClient = db) {
        return await client
            .update(warrantyTable)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where(eq(warrantyTable.serial, serial))
            .returning();
    }

    static async list(query: any) {
        return paginateQuery({
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 10,
            query: db.query.warrantyTable,
            countTable: warrantyTable,
            search: query.search,
            searchColumns: [warrantyTable.serial, warrantyTable.note],
            where: [eq(warrantyTable.isDeleted, false)],
            with: {
                product: {
                    columns: { id: true, name: true },
                },
                customer: {
                    columns: { id: true, name: true },
                },
                supplier: {
                    columns: { id: true, name: true },
                },
            },
        });
    }
}
