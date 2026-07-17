import { count, desc, eq, ilike } from "drizzle-orm";
import db from "../../drizzle/src";
import { bannerTable } from "./banner.table";
import { CreateBannerInput } from "./ecom.type";

export default class BannerRepository {
    static async create(payload: CreateBannerInput) {
        return await db.insert(bannerTable).values(payload).returning();
    }

    static async findByID(id: number) {
        const result = await db.select().from(bannerTable).where(eq(bannerTable.id, id));
        return result[0] || null;
    }

    static async delete(id: number) {
        return await db.delete(bannerTable).where(eq(bannerTable.id, id));
    }

    static async update(id: number, payload: Partial<CreateBannerInput>) {
        return await db.update(bannerTable).set(payload).where(eq(bannerTable.id, id)).returning();
    }

    static async list(search = "", page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const whereClause = search.trim() ? ilike(bannerTable.title, `%${search.trim()}%`) : undefined;

        const [items, totalResult] = await Promise.all([
            db.select().from(bannerTable).where(whereClause).orderBy(desc(bannerTable.sortOrder)).limit(limit).offset(offset),
            db.select({ total: count() }).from(bannerTable).where(whereClause),
        ]);

        return { items, total: Number(totalResult[0].total), page, limit };
    }

    static async activeBanners() {
        return db.select({
            id: bannerTable.id,
            title: bannerTable.title,
            photo: bannerTable.photo,
            link: bannerTable.link,
        }).from(bannerTable).where(eq(bannerTable.isActive, true)).orderBy(desc(bannerTable.sortOrder));
    }
}
