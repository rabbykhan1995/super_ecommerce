import { count, desc, eq, ilike } from "drizzle-orm";
import db from "../../drizzle/src";
import { brandTable } from "./brand.table";
import { CreateBrandInput } from "./brand.type";

export default class BrandRepository {
    static async create(payload: CreateBrandInput) {
        return await db.insert(brandTable).values(payload).returning();
    }

    static async findByName(name: string) {
        const result = await db
            .select()
            .from(brandTable)
            .where(eq(brandTable.name, name.trim().toLowerCase()));

        return result[0] || null;
    }
    static async findByID(brandID: any) {
        const result = await db.select().from(brandTable).where(eq(brandTable.id, brandID));
        return result;
    }

    static async delete(brandID: any) {
        return await db.delete(brandTable).where(eq(brandTable.id, brandID));
    }

    static async update(brandID: any, payload: CreateBrandInput) {
        return await db.update(brandTable).set(payload).where(eq(brandTable.id, brandID)).returning();
    }

    static async list(
        search = "",
        page = 1,
        limit = 10
    ) {
        const offset = (page - 1) * limit;

        // Search condition
        const whereClause = search.trim()
            ? ilike(brandTable.name, `%${search.trim()}%`)
            : undefined;

        const [items, totalResult] = await Promise.all([
            db
                .select({
                    id: brandTable.id,
                    name: brandTable.name,
                    createdAt: brandTable.createdAt,
                })
                .from(brandTable)
                .where(whereClause)
                .orderBy(desc(brandTable.createdAt))
                .limit(limit)
                .offset(offset),

            db
                .select({
                    total: count(),
                })
                .from(brandTable)
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