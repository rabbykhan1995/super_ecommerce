import mongoose from "mongoose";
import { CreateDamageInput } from "./damage.type";
import ProductService from "../product/product.service";
import { ApiError } from "../../utils/ApiError";
import DamageRepository from "./damage.repository";

export default class DamageService {
    static async create(payload: CreateDamageInput) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const damageDocsData = [];

            for (const item of payload.items) {
                const product = await ProductService.findById(
                    item.productID,
                    session
                );

                if (!product) {
                    throw new ApiError(404, "Product not found");
                }

                const batch = await ProductService.findBatchByID(
                    item.batchID as string,
                    session
                );

                if (!batch) {
                    throw new ApiError(404, "Batch not found");
                }

                // stock validation
                if (batch.remainingQty < item.damageQty) {
                    throw new ApiError(
                        400,
                        `Not enough stock in batch ${batch._id}`
                    );
                }

                // prepare damage doc
                damageDocsData.push({
                    batchID: item.batchID,
                    productID: item.productID,
                    damagedQty: item.damageQty,
                    purchasePrice: batch.purchasePrice,
                    reason: payload.reason,
                    note: payload.note,
                    DamageDate: payload.DamageDate,
                });

                // update batch
                const updatedBatch =
                    await ProductService.updateBatchDynamically(
                        item.batchID as string,
                        {
                            inc: {
                                remainingQty: -item.damageQty,
                                damagedQty: item.damageQty,
                            },
                        },
                        session
                    );

                // deactivate batch if empty
                if (updatedBatch && updatedBatch.remainingQty <= 0) {
                    await ProductService.updateBatchDynamically(
                        item.batchID as string,
                        {
                            set: {
                                isActive: false,
                            },
                        },
                        session
                    );
                }

                // update product stock
                await ProductService.updateProductFifoBatchAndStock(
                    item.productID?.toString(),
                    {
                        qty: -item.damageQty,
                    },
                    session
                );
            }

            // create damage records
            const damages = await DamageRepository.insertMany(
                damageDocsData,
                session
            );

            await session.commitTransaction();

            return damages;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    static async list(query: any) {
        return await DamageRepository.list(query);
    }

    static async delete(id: string) {
        const damage = await DamageRepository.findByID(id);
        if (!damage) {
            throw new ApiError(404, "no damage found");
        }

        if (damage && !damage.deletable) {
            throw new ApiError(403, "This damage record is locked and cannot be deleted");
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const batch = await ProductService.findBatchByID(damage.batchID!.toString(), session);
            const product = await ProductService.findById(damage.productID.toString(), session);

            if (!batch || !product) {
                throw new ApiError(404, "Batch or Product not found");
            }

            await ProductService.updateBatchDynamically(
                damage.batchID!.toString(),
                {
                    inc: {
                        remainingQty: damage.damagedQty,
                        damagedQty: -damage.damagedQty,
                    },
                    set:{
                        isActive:true
                    }
                },
                session
            );

            // 2. rollback product stock (if global stock maintained)
            await ProductService.updateProductFifoBatchAndStock(
                batch.productID?.toString(),
                {
                    qty: damage.damagedQty,
                },
                session
            );
            // 4. delete damage record


            await session.commitTransaction();
            return await DamageRepository.delete(damage._id.toString(), session);

        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }


    }
}