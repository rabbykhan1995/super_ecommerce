import { count, desc, eq } from "drizzle-orm";
import db from "../../drizzle/src";
import { featuredProductTable } from "./featured_product.table";
import { productTable } from "../product/product.table";
import { CreateFeaturedProductInput } from "./ecom.type";

export default class FeaturedProductRepository {
    static async add(payload: CreateFeaturedProductInput) {
        return await db.insert(featuredProductTable).values(payload).returning();
    }

    static async remove(id: number) {
        return await db.delete(featuredProductTable).where(eq(featuredProductTable.id, id));
    }

    static async findByID(id: number) {
        const result = await db.select().from(featuredProductTable).where(eq(featuredProductTable.id, id));
        return result[0] || null;
    }

    static async findByProductID(productID: number) {
        const result = await db.select().from(featuredProductTable).where(eq(featuredProductTable.productID, productID));
        return result[0] || null;
    }

    static async list(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const [items, totalResult] = await Promise.all([
            db.select({
                id: featuredProductTable.id,
                productID: featuredProductTable.productID,
                sortOrder: featuredProductTable.sortOrder,
                createdAt: featuredProductTable.createdAt,
                product: {
                    id: productTable.id,
                    name: productTable.name,
                    slug: productTable.slug,
                    thumbnail: productTable.thumbnail,
                    salePrice: productTable.salePrice,
                    stock: productTable.stock,
                    isPublished: productTable.isPublished,
                },
            }).from(featuredProductTable)
                .innerJoin(productTable, eq(featuredProductTable.productID, productTable.id))
                .orderBy(desc(featuredProductTable.sortOrder))
                .limit(limit)
                .offset(offset),
            db.select({ total: count() }).from(featuredProductTable),
        ]);

        return { items, total: Number(totalResult[0].total), page, limit };
    }

    static async activeFeaturedProducts() {
        return db.select({
            id: productTable.id,
            name: productTable.name,
            slug: productTable.slug,
            thumbnail: productTable.thumbnail,
            salePrice: productTable.salePrice,
            stock: productTable.stock,
            totalSold: productTable.totalSold,
            averageRating: productTable.averageRating,
            totalReviews: productTable.totalReviews,
            video: productTable.video,
            shortDescription: productTable.shortDescription,
        }).from(featuredProductTable)
            .innerJoin(productTable, eq(featuredProductTable.productID, productTable.id))
            .orderBy(desc(featuredProductTable.sortOrder));
    }
}
