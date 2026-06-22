import { count, desc, eq, ilike } from "drizzle-orm";
import db from "../../drizzle/src";
import { categoryTable } from "./category.table";
import { CreateCategoryInput } from "./category.type";

export default class CategoryRepository {
    static async create(payload: CreateCategoryInput) {
        return await db.insert(categoryTable).values(payload).returning();
    }

    static async findByName(name: string) {
        const result = await db
            .select()
            .from(categoryTable)
            .where(eq(categoryTable.name, name.trim().toLowerCase()));

        return result[0] || null;
    }
    static async findByID(brandID: any) {
        const result = await db.select().from(categoryTable).where(eq(categoryTable.id, brandID));
        return result;
    }

    static async delete(brandID: any) {
        return await db.delete(categoryTable).where(eq(categoryTable.id, brandID));
    }

    static async update(brandID: any, payload: CreateCategoryInput) {
        return await db.update(categoryTable).set(payload).where(eq(categoryTable.id, brandID)).returning();
    }

    static async list(
        search = "",
        page = 1,
        limit = 10
    ) {
        const offset = (page - 1) * limit;

        // Search condition
        const whereClause = search.trim()
            ? ilike(categoryTable.name, `%${search.trim()}%`)
            : undefined;

        const [items, totalResult] = await Promise.all([
            db
                .select({
                    id: categoryTable.id,
                    name: categoryTable.name,
                    createdAt: categoryTable.createdAt,
                })
                .from(categoryTable)
                .where(whereClause)
                .orderBy(desc(categoryTable.createdAt))
                .limit(limit)
                .offset(offset),

            db
                .select({
                    total: count(),
                })
                .from(categoryTable)
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