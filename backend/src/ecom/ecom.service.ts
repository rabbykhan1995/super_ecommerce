import {
    CreateBannerInput, UpdateBannerInput,
    CreateFlashSaleInput, UpdateFlashSaleInput, CreateFlashSaleProductInput,
    CreateFeaturedProductInput,
} from "./ecom.type";
import { ApiError } from "../../utils/ApiError";
import { BannerRepository, FlashSaleRepository, FeaturedProductRepository, EcomProductListRepository, EcomProductListQuery } from "./ecom.repository";
import redis from "../../config/redis.config";

// ─── Banner Service ──────────────────────────────────────────────────────────

const BANNER_CACHE_KEY = "ecom:banners";

export class BannerService {
    static async create(payload: CreateBannerInput) {
        const total = await BannerRepository.count();
        if (total >= 5) throw new ApiError(400, "Maximum 5 banners allowed");
        const banner = await BannerRepository.create(payload);
        if (!banner) throw new ApiError(400, "Banner creation failed");
        await this.invalidateCache();
        return banner;
    }

    static async update(id: number, payload: UpdateBannerInput) {
        const exists = await BannerRepository.findByID(id);
        if (!exists) throw new ApiError(404, "Banner not found");
        const banner = await BannerRepository.update(id, payload);
        if (!banner) throw new ApiError(400, "Banner update failed");
        await this.invalidateCache();
        return banner;
    }

    static async delete(id: number) {
        const exists = await BannerRepository.findByID(id);
        if (!exists) throw new ApiError(404, "Banner not found");
        await BannerRepository.delete(id);
        await this.invalidateCache();
    }

    static async list(search?: string, page?: number, limit?: number) {
        return await BannerRepository.list(search, page, limit);
    }

    static async activeBanners() {
        const cached = await redis.get(BANNER_CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const banners = await BannerRepository.activeBanners();
        await redis.set(BANNER_CACHE_KEY, JSON.stringify(banners), "EX", 300);
        return banners;
    }

    private static async invalidateCache() {
        await redis.del(BANNER_CACHE_KEY);
    }
}

// ─── Flash Sale Service ──────────────────────────────────────────────────────

const FLASH_SALE_CACHE_KEY = "ecom:flash_sale";

export class FlashSaleService {
    static async createSale(payload: CreateFlashSaleInput) {
        const sale = await FlashSaleRepository.createSale(payload);
        if (!sale) throw new ApiError(400, "Flash sale creation failed");
        await this.invalidateCache();
        return sale;
    }

    static async updateSale(id: number, payload: UpdateFlashSaleInput) {
        const exists = await FlashSaleRepository.findSaleByID(id);
        if (!exists) throw new ApiError(404, "Flash sale not found");
        const sale = await FlashSaleRepository.updateSale(id, payload);
        if (!sale) throw new ApiError(400, "Flash sale update failed");
        await this.invalidateCache();
        return sale;
    }

    static async deleteSale(id: number) {
        const exists = await FlashSaleRepository.findSaleByID(id);
        if (!exists) throw new ApiError(404, "Flash sale not found");
        await FlashSaleRepository.deleteSale(id);
        await this.invalidateCache();
    }

    static async listSales(search?: string, page?: number, limit?: number) {
        return await FlashSaleRepository.listSales(search, page, limit);
    }

    static async activeSaleWithProducts() {
        const cached = await redis.get(FLASH_SALE_CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const sale = await FlashSaleRepository.activeSaleWithProducts();
        if (sale) {
            await redis.set(FLASH_SALE_CACHE_KEY, JSON.stringify(sale), "EX", 120);
        }
        return sale;
    }

    static async addProduct(payload: CreateFlashSaleProductInput) {
        const exists = await FlashSaleRepository.findSaleByID(payload.flashSaleID);
        if (!exists) throw new ApiError(404, "Flash sale not found");
        const product = await FlashSaleRepository.addProduct(payload);
        if (!product) throw new ApiError(400, "Failed to add product to flash sale");
        await this.invalidateCache();
        return product;
    }

    static async removeProduct(id: number) {
        const exists = await FlashSaleRepository.findProductByID(id);
        if (!exists) throw new ApiError(404, "Flash sale product not found");
        await FlashSaleRepository.removeProduct(id);
        await this.invalidateCache();
    }

    static async productsBySaleID(flashSaleID: number) {
        return await FlashSaleRepository.productsBySaleID(flashSaleID);
    }

    private static async invalidateCache() {
        await redis.del(FLASH_SALE_CACHE_KEY);
    }
}

// ─── Featured Product Service ────────────────────────────────────────────────

const FEATURED_CACHE_KEY = "ecom:featured_products";

export class FeaturedProductService {
    static async add(payload: CreateFeaturedProductInput) {
        const existing = await FeaturedProductRepository.findByProductID(payload.productID);
        if (existing) throw new ApiError(400, "Product is already featured");
        const product = await FeaturedProductRepository.add(payload);
        if (!product) throw new ApiError(400, "Failed to add featured product");
        await this.invalidateCache();
        return product;
    }

    static async remove(id: number) {
        const exists = await FeaturedProductRepository.findByID(id);
        if (!exists) throw new ApiError(404, "Featured product not found");
        await FeaturedProductRepository.remove(id);
        await this.invalidateCache();
    }

    static async list(page?: number, limit?: number) {
        return await FeaturedProductRepository.list(page, limit);
    }

    static async toggle(productID: number) {
        const existing = await FeaturedProductRepository.findByProductID(productID);
        if (existing) {
            await FeaturedProductRepository.remove(existing.id);
            await this.invalidateCache();
            return { featured: false };
        }
        await FeaturedProductRepository.add({ productID, sortOrder: 0 });
        await this.invalidateCache();
        return { featured: true };
    }

    static async activeFeaturedProducts() {
        const cached = await redis.get(FEATURED_CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const products = await FeaturedProductRepository.activeFeaturedProducts();
        await redis.set(FEATURED_CACHE_KEY, JSON.stringify(products), "EX", 300);
        return products;
    }

    private static async invalidateCache() {
        await redis.del(FEATURED_CACHE_KEY);
    }
}

// ─── Ecom Product List Service ─────────────────────────────────────────────

export class EcomProductListService {
    static async featuredProducts() {
        return await FeaturedProductRepository.activeFeaturedProducts();
    }

    static async flashProducts() {
        const sale = await FlashSaleRepository.activeSaleWithProducts();
        if (!sale) return [];

        return sale.products.map((fp) => ({
            id: fp.product.id,
            name: fp.product.name,
            slug: fp.product.slug,
            thumbnail: fp.product.thumbnail,
            salePrice: fp.product.salePrice,
            stock: fp.product.stock,
            totalSold: fp.product.totalSold,
            averageRating: fp.product.averageRating,
            totalReviews: fp.product.totalReviews,
            video: fp.product.video,
            shortDescription: fp.product.shortDescription,
            discountPrice: fp.discountPrice,
        }));
    }

    static async offerProducts(query: EcomProductListQuery) {
        return await EcomProductListRepository.list({
            ...query,
            published: true,
        });
    }
}
