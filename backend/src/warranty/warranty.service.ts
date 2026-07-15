import { WarrantyPayload, WarrantyResponse } from "./warranty.type";
import WarrantyRepository from "./warranty.repository";
import { ApiError } from "../../utils/ApiError";
import { QueryClient } from "../../drizzle/src";
import { withTransaction } from "../../utils/withTransaction";
import SaleService from "../sale/sale.service";

export default class WarrantyService {
    static async create(payload: WarrantyPayload, tx?: QueryClient) {
        const warranty = await WarrantyRepository.create(payload, tx);
        if (!warranty) {
            throw new ApiError(500, "Warranty not created");
        }
        return warranty;
    }

    static async deleteManyBySaleID(saleID: number, tx?: QueryClient) {
        const result = await WarrantyRepository.deleteManyBySaleID(saleID, tx);
        return result;
    }

    static async list(query: any) {
        return await WarrantyRepository.list(query);
    }

    static async claimWarranty(warrantyID: number, body: Partial<WarrantyPayload>) {
        const warranty = await WarrantyRepository.findByID(warrantyID);
        if (!warranty) {
            throw new ApiError(404, "Warranty not found");
        }

        return await withTransaction(async (tx) => {
            const updated = await WarrantyRepository.updateByID(warrantyID, {
                status: "claimed",
                claimDate: body.claimDate ?? new Date(),
                issueDescription: body.issueDescription,
            }, tx);

            await SaleService.update(warranty.saleID, { deletable: false }, tx);

            return updated;
        });
    }

    static async sendToSupplier(warrantyID: number, body: Partial<WarrantyPayload>) {
        const warranty = await WarrantyRepository.findByID(warrantyID);
        if (!warranty) {
            throw new ApiError(404, "Warranty not found");
        }

        return await WarrantyRepository.updateByID(warrantyID, {
            status: "sent_to_supplier",
            supplierID: body.supplierID,
            sentDate: body.sentDate ?? new Date(),
            supplierNote: body.supplierNote,
        });
    }

    static async supplierActionUpdate(warrantyID: number, body: Partial<WarrantyPayload>) {
        const warranty = await WarrantyRepository.findByID(warrantyID);
        if (!warranty) {
            throw new ApiError(404, "Warranty not found");
        }

        return await WarrantyRepository.updateByID(warrantyID, {
            status: body.status,
            supplierAction: body.supplierAction,
            replacedSerial: body.replacedSerial,
            replacedBatchID: body.replacedBatchID,
            refundAmount: body.refundAmount,
        });
    }

    static async recieveFromSupplier(warrantyID: number, body: Partial<WarrantyPayload>) {
        const warranty = await WarrantyRepository.findByID(warrantyID);
        if (!warranty) {
            throw new ApiError(404, "Warranty not found");
        }

        return await WarrantyRepository.updateByID(warrantyID, {
            status: "received_from_supplier",
            receivedDate: body.receivedDate ?? new Date(),
        });
    }

    static async returnToCustomer(warrantyID: number, body: Partial<WarrantyPayload>) {
        const warranty = await WarrantyRepository.findByID(warrantyID);
        if (!warranty) {
            throw new ApiError(404, "Warranty not found");
        }

        return await WarrantyRepository.updateByID(warrantyID, {
            status: "returned_to_customer",
        });
    }
}
