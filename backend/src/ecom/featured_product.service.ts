import { CreateFeaturedProductInput } from "./ecom.type";
import { ApiError } from "../../utils/ApiError";
import FeaturedProductRepository from "./featured_product.repository";
import redis from "../../config/redis.config";

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
