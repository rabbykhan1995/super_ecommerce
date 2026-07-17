import { count, desc, eq, ilike, and, gte, lte } from "drizzle-orm";
import db from "../../drizzle/src";
import { flashSaleTable, flashSaleProductTable } from "./flash_sale.table";
import { productTable } from "../product/product.table";
import { CreateFlashSaleInput, CreateFlashSaleProductInput } from "./ecom.type";

export default class FlashSaleRepository {
    static async createSale(payload: CreateFlashSaleInput) {
        return await db.insert(flashSaleTable).values({
            ...payload,
            startDate: new Date(payload.startDate),
            endDate: new Date(payload.endDate),
        }).returning();
    }

    static async findSaleByID(id: number) {
        const result = await db.select().from(flashSaleTable).where(eq(flashSaleTable.id, id));
        return result[0] || null;
    }

    static async deleteSale(id: number) {
        return await db.delete(flashSaleTable).where(eq(flashSaleTable.id, id));
    }

    static async updateSale(id: number, payload: Partial<CreateFlashSaleInput>) {
        const update: Record<string, any> = { ...payload };
        if (payload.startDate) update.startDate = new Date(payload.startDate);
        if (payload.endDate) update.endDate = new Date(payload.endDate);
        return await db.update(flashSaleTable).set(update).where(eq(flashSaleTable.id, id)).returning();
    }

    static async listSales(search = "", page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const whereClause = search.trim() ? ilike(flashSaleTable.name, `%${search.trim()}%`) : undefined;

        const [items, totalResult] = await Promise.all([
            db.select().from(flashSaleTable).where(whereClause).orderBy(desc(flashSaleTable.createdAt)).limit(limit).offset(offset),
            db.select({ total: count() }).from(flashSaleTable).where(whereClause),
        ]);

        return { items, total: Number(totalResult[0].total), page, limit };
    }

    static async activeSaleWithProducts() {
        const now = new Date();
        const sale = await db.query.flashSaleTable.findFirst({
            where: and(
                eq(flashSaleTable.isActive, true),
                lte(flashSaleTable.startDate, now),
                gte(flashSaleTable.endDate, now),
            ),
            orderBy: desc(flashSaleTable.createdAt),
            with: {
                products: {
                    orderBy: (fsp, { asc }) => [asc(fsp.sortOrder)],
                    with: {
                        product: true,
                    },
                },
            },
        });
        return sale || null;
    }

    static async addProduct(payload: CreateFlashSaleProductInput) {
        return await db.insert(flashSaleProductTable).values(payload).returning();
    }

    static async removeProduct(id: number) {
        return await db.delete(flashSaleProductTable).where(eq(flashSaleProductTable.id, id));
    }

    static async findProductByID(id: number) {
        const result = await db.select().from(flashSaleProductTable).where(eq(flashSaleProductTable.id, id));
        return result[0] || null;
    }

    static async productsBySaleID(flashSaleID: number) {
        return db.select({
            id: flashSaleProductTable.id,
            productID: flashSaleProductTable.productID,
            discountPrice: flashSaleProductTable.discountPrice,
            sortOrder: flashSaleProductTable.sortOrder,
            productName: productTable.name,
            productSlug: productTable.slug,
            productThumbnail: productTable.thumbnail,
            productSalePrice: productTable.salePrice,
            productStock: productTable.stock,
        }).from(flashSaleProductTable)
            .innerJoin(productTable, eq(flashSaleProductTable.productID, productTable.id))
            .where(eq(flashSaleProductTable.flashSaleID, flashSaleID))
            .orderBy(desc(flashSaleProductTable.sortOrder));
    }
}
