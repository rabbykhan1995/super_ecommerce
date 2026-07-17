import { CreateFlashSaleInput, UpdateFlashSaleInput, CreateFlashSaleProductInput } from "./ecom.type";
import { ApiError } from "../../utils/ApiError";
import FlashSaleRepository from "./flash_sale.repository";
import redis from "../../config/redis.config";

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
