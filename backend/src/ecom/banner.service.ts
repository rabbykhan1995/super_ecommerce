import { CreateBannerInput, UpdateBannerInput } from "./ecom.type";
import { ApiError } from "../../utils/ApiError";
import BannerRepository from "./banner.repository";
import redis from "../../config/redis.config";

const BANNER_CACHE_KEY = "ecom:banners";

export class BannerService {
    static async create(payload: CreateBannerInput) {
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
