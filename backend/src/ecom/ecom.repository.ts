import { count, desc, eq, ilike, and, gte, lte, asc, sql, gt, inArray, or, isNotNull } from "drizzle-orm";
import db from "../../drizzle/src";
import { bannerTable, flashSaleTable, flashSaleProductTable, featuredProductTable } from "./ecom.table";
import { productTable } from "../product/product.table";
import { CreateBannerInput, CreateFlashSaleInput, CreateFlashSaleProductInput, CreateFeaturedProductInput } from "./ecom.type";

// ─── Banner Repository ───────────────────────────────────────────────────────

export class BannerRepository {
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
        return await db.update(bannerTable).set({ ...payload, updatedAt: new Date() }).where(eq(bannerTable.id, id)).returning();
    }

    static async count() {
        const result = await db.select({ total: count() }).from(bannerTable);
        return Number(result[0].total);
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

// ─── Flash Sale Repository ───────────────────────────────────────────────────

export class FlashSaleRepository {
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

// ─── Featured Product Repository ─────────────────────────────────────────────

export class FeaturedProductRepository {
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

// ─── Ecom Product List Repository ─────────────────────────────────────────

export type EcomProductListQuery = {
    page?: number;
    limit?: number;
    search?: string;
    categoryID?: number[];
    brandID?: number[];
    unitID?: number[];
    featured?: boolean;
    inStock?: boolean;
    published?: boolean;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sort?: "latest" | "oldest" | "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc" | "bestSelling";
};

export class EcomProductListRepository {
    static async list(query: EcomProductListQuery) {
        const conditions: ReturnType<typeof and>[] = [];

        conditions.push(isNotNull(productTable.discountPrice));

        if (query.search?.trim()) {
            const keyword = `%${query.search.trim()}%`;
            conditions.push(
                or(
                    ilike(productTable.name, keyword),
                    ilike(productTable.slug, keyword),
                    ilike(productTable.sku, keyword)
                )!
            );
        }

        if (query.categoryID?.length) {
            conditions.push(inArray(productTable.categoryID, query.categoryID));
        }

        if (query.brandID?.length) {
            conditions.push(inArray(productTable.brandID, query.brandID));
        }

        if (query.unitID?.length) {
            conditions.push(inArray(productTable.unitID, query.unitID));
        }

        if (query.featured !== undefined) {
            conditions.push(eq(productTable.featured, query.featured));
        }

        if (query.published !== undefined) {
            conditions.push(eq(productTable.isPublished, query.published));
        }

        if (query.inStock) {
            conditions.push(gt(productTable.stock, 0));
        }

        if (query.minRating) {
            conditions.push(gte(productTable.averageRating, query.minRating));
        }

        if (query.minPrice != null || query.maxPrice != null) {
            const priceConditions: ReturnType<typeof and>[] = [];
            if (query.minPrice != null) {
                priceConditions.push(gte(productTable.salePrice, query.minPrice));
            }
            if (query.maxPrice != null) {
                priceConditions.push(lte(productTable.salePrice, query.maxPrice));
            }
            conditions.push(and(...priceConditions)!);
        }

        let orderBy;
        switch (query.sort) {
            case "oldest": orderBy = asc(productTable.createdAt); break;
            case "priceAsc": orderBy = asc(productTable.salePrice); break;
            case "priceDesc": orderBy = desc(productTable.salePrice); break;
            case "nameAsc": orderBy = asc(productTable.name); break;
            case "nameDesc": orderBy = desc(productTable.name); break;
            case "bestSelling": orderBy = desc(productTable.totalSold); break;
            default: orderBy = desc(productTable.createdAt);
        }

        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const offset = (page - 1) * limit;

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [rawItems, totalResult] = await Promise.all([
            db.select({
                id: productTable.id,
                name: productTable.name,
                slug: productTable.slug,
                thumbnail: productTable.thumbnail,
                video: productTable.video,
                stock: productTable.stock,
                totalSold: productTable.totalSold,
                salePrice: productTable.salePrice,
                discountPrice: productTable.discountPrice,
                averageRating: productTable.averageRating,
                totalReviews: productTable.totalReviews,
                shortDescription: productTable.shortDescription,
            })
                .from(productTable)
                .leftJoin(flashSaleProductTable, eq(flashSaleProductTable.productID, productTable.id))
                .where(whereClause)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset),
            db.select({ total: count() }).from(productTable).where(whereClause),
        ]);

        const total = Number(totalResult[0]?.total ?? 0);

        const seen = new Set<number>();
        const items = rawItems.filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });

        return { items, total, page, limit };
    }
}


