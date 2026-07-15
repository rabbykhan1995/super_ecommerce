import { CreateDamageInput, DamagePayload } from "./damage.type";
import ProductService from "../product/product.service";
import { ApiError } from "../../utils/ApiError";
import DamageRepository from "./damage.repository";
import { withTransaction } from "../../utils/withTransaction";
import { text } from "drizzle-orm/mysql-core";
import { stockFlowPayload } from "../product/product.type";
import { RedisReportService } from "../../utils/ReportServiceRedis";

export default class DamageService {
    static async create(payload: CreateDamageInput) {
        await withTransaction(async (tx) => {
            for (const item of payload.items) {
                const product = await ProductService.findById(
                    item.productID,
                    tx
                );

                if (!product) {
                    throw new ApiError(404, "Product not found");
                }

                const batch = await ProductService.findBatchByID(
                    item.batchID!,
                );

                // stock validation
                if (batch!.remainingQty < item.damagedQty) {
                    throw new ApiError(
                        400,
                        `Not enough stock in batch ${batch!.id}`
                    );
                }

                const [, , , damage] = await Promise.all([
                    ProductService.decreaseBatchStock(batch!.id, item.damagedQty, tx),
                    ProductService.decreaseVariantStock(item.variantID, item.damagedQty, tx),
                    ProductService.decreaseProductStock(item.productID, item.damagedQty, tx),
                    DamageRepository.create(item, tx),
                ]);

                const stockFlowPayload: stockFlowPayload = {
                    batchID: item.batchID!,
                    productID: item.productID,
                    variantID: item.variantID,
                    referenceType: "damage",
                    damageID: damage.id,
                    type: "out",
                    beforeQty: batch!.remainingQty,
                    afterQty: batch!.remainingQty - item.damagedQty,
                    qty: item.damagedQty,
                }

                await ProductService.createStockFlow(stockFlowPayload, tx);
            }

        })

    }

    static async list(query: any) {
        return await DamageRepository.list(query);
    }

    static async delete(id: number) {
        const damage = await DamageRepository.findByID(id);
        if (!damage) {
            throw new ApiError(404, "no damage found");
        }

        if (damage && !damage.deletable) {
            throw new ApiError(403, "This damage record is locked and cannot be deleted");
        }

        await withTransaction(async (tx) => {

            await Promise.all([
                ProductService.increaseBatchStock(damage.batchID!, damage.damagedQty, tx),
                ProductService.increaseVariantStock(damage.variantID!, damage.damagedQty, tx),
                ProductService.increaseProductStock(damage.productID!, damage.damagedQty, tx)
            ]);


            return await DamageRepository.delete(damage.id, tx);

        })



    }
}