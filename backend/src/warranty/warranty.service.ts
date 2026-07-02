import mongoose, { ClientSession } from "mongoose";
import { CreateWarrantyInput } from "./warranty.validator";
import WarrantyRepositoy from "./warranty.repository";
import { ApiError } from "../../utils/ApiError";
import { IWarranty, WarrantyPayload, WarrantyResponse, WarrantyStatus } from "./warranty.type";
import { AccountService } from "../account/account.service";
import { BatchResponse } from "../product/product.type";
import ProductService from "../product/product.service";
import PayloadBuilder, { BatchPayloadItem } from "../../utils/builder";
import SaleService from "../sale/sale.service";
import { QueryClient } from "../../drizzle/src";

export default class WarrantyService {
    static async create(payload: WarrantyPayload, tx?: QueryClient) {
        const warranty = await WarrantyRepositoy.create(payload, tx);
        if (!warranty) {
            throw new ApiError(401, "Warranty not created");
        }

        return warranty;
    }

    static async deleteManyBySaleID(saleID: string, session?: ClientSession) {
        const warranty = await WarrantyRepositoy.deleteManyBySaleID(saleID, session);
        if (!warranty) {
            throw new ApiError(401, "Warranty not created");
        }

        return warranty;
    }

    static async list(query: any) {
        return await WarrantyRepositoy.list(query);
    }

    static async claimWarranty(warrantyID: string, body: Partial<IWarranty>) {
        const status: WarrantyStatus = "claimed";
        const payload = { ...body, status }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const warrantyUpdated = await WarrantyRepositoy.updateByID(warrantyID, payload, session);
            await SaleService.findAndUpdateByID(warrantyUpdated!.saleID.toString(), {
                deletable: false,
            },
                session)
            await session.commitTransaction();
            return warrantyUpdated;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }
    static async sendToSupplier(warrantyID: string, body: Partial<IWarranty>) {
        const status: WarrantyStatus = "sent_to_supplier";
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            if (body.accounts && body.accounts?.length > 0) {
                await AccountService.decreaseBalance(body.accounts.map(a => ({ ...a, accountID: a.accountID.toString() })), session);
            }

            const payload = { ...body, status }
            console.log(payload)
            const warrantyUpdated = await WarrantyRepositoy.updateByID(warrantyID, payload, session);

            await session.commitTransaction();
            return warrantyUpdated
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    static async supplierActionUpdate(warrantyID: string, body: Partial<IWarranty>) {
        const status: WarrantyStatus = body.status as WarrantyStatus;
        let newBatches: BatchResponse[] | undefined;
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const warranty: WarrantyResponse | null = await WarrantyRepositoy.findByID(warrantyID, session);
            if (!warranty) {
                throw new ApiError(404, "Warranty not found");
            }
            if (status === "replaced") {
                if (!body.replacedSerial) {
                    throw new ApiError(401, "Required new serial");
                }
                const batchPayload = PayloadBuilder.batch(
                    [
                        {
                            productID: warranty.productID,
                            serial: body.serial,
                            purchasedQty: 0,
                            purchasePrice: 0,
                            salePrice: 0,
                            warranty: body.warranty,
                        }
                    ],
                    { isActive: false }
                );

                newBatches = await ProductService.createBatches(batchPayload, session);

            }

            if (status === "refunded" && !body.refundAmount) {
                throw new ApiError(401, "Refund Amount is required");
            }

            const payload = {
                ...body,
                status,
                supplierAction: status,
                ...(!!newBatches && status === "replaced" ? {
                    replacedBatchID: newBatches[0]._id,
                    replacedSerail: newBatches[0].serial,
                    warranty: newBatches[0].warranty
                } : {}),
                ...(status === "refunded" && { refundAmount: body.refundAmount }),
            }
            const warrantyUpdated = await WarrantyRepositoy.updateByID(warrantyID, payload, session);
            await session.commitTransaction();

            return warrantyUpdated
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }


    }

    static async recieveFromSupplier(warrantyID: string, body: Partial<IWarranty>) {
        const status: WarrantyStatus = "received_from_supplier";

        const payload = { ...body, status }

        return await WarrantyRepositoy.updateByID(warrantyID, payload);
    }
    // Ekhane warranty create hobe return to customer er vetor jodi supplierAction = replaced hoi, tokhon new warranty assign hobe.
    static async returnToCustomer(warrantyID: string, body: Partial<IWarranty>) {
        const status: WarrantyStatus = "returned_to_customer";

        const payload = { ...body, status }

        return await WarrantyRepositoy.updateByID(warrantyID, payload);
    }
}