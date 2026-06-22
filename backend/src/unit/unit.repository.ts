import { count, desc, eq, ilike } from "drizzle-orm";
import db from "../../drizzle/src";
import { unitTable } from "./unit.table";
import { CreateUnitInput } from "./unit.type";

export default class UnitRepository {
    static async create(payload: CreateUnitInput) {
        return await db.insert(unitTable).values(payload).returning();
    }

    static async findByName(name: string) {
        const result = await db
            .select()
            .from(unitTable)
            .where(eq(unitTable.name, name.trim().toLowerCase()));

        return result[0] || null;
    }
    static async findByID(unitID: any) {
        const result = await db.select().from(unitTable).where(eq(unitTable.id, unitID));
        return result;
    }

    static async delete(unitID: any) {
        return await db.delete(unitTable).where(eq(unitTable.id, unitID));
    }

    static async update(unitID: any, payload: CreateUnitInput) {
        return await db.update(unitTable).set(payload).where(eq(unitTable.id, unitID)).returning();
    }

    static async list(
        search = "",
        page = 1,
        limit = 10
    ) {
        const offset = (page - 1) * limit;

        // Search condition
        const whereClause = search.trim()
            ? ilike(unitTable.name, `%${search.trim()}%`)
            : undefined;

        const [items, totalResult] = await Promise.all([
            db
                .select({
                    id: unitTable.id,
                    name: unitTable.name,
                    createdAt: unitTable.createdAt,
                })
                .from(unitTable)
                .where(whereClause)
                .orderBy(desc(unitTable.createdAt))
                .limit(limit)
                .offset(offset),

            db
                .select({
                    total: count(),
                })
                .from(unitTable)
                .where(whereClause),
        ]);

        return {
            items,
            total: Number(totalResult[0].total),
            page,
            limit,
            totalPages: Math.ceil(
                Number(totalResult[0].total) / limit
            ),
        };
    }
}