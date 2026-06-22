import { ClientSession } from "mongoose";
import Warranty from "./warranty.model";
import { paginatedAggregate } from "../../utils/aggregationQueryBuilder";
import { IWarranty, WarrantyResponse } from "./warranty.type";

export default class WarrantyRepositoy {
    static async create(payload: any, session?: ClientSession) {
        return await Warranty.create([payload], { session });
    }

    static async createMany(payloads: any[], session?: ClientSession) {
        return await Warranty.insertMany(payloads, { session });
    }

    static async findByID(id: string, session?: ClientSession):Promise<WarrantyResponse | null> {
        return await Warranty.findById(id).session(session ?? null);
    }

    static async findBySaleID(saleID: string, session?: ClientSession) {
        return await Warranty.find({ saleID }).session(session ?? null);
    }

    static async updateByID(id: string, payload: any, session?: ClientSession) {
        return await Warranty.findByIdAndUpdate(id, payload, { new: true, session });
    }

    static async deleteByID(id: string, session?: ClientSession) {
        return await Warranty.findByIdAndDelete(id).session(session ?? null);
    }

    static async deleteManyBySaleID(saleID: string, session?: ClientSession) {
        return await Warranty.deleteMany({ saleID }).session(session ?? null);
    }

    static async list(query: any) {
        return await paginatedAggregate({
            model: Warranty,
            query,
            postLookupSearch: true,
            searchFields: [
                { field: "serial" },
            ],
            lookups: [
                {
                    from: "contacts",
                    localField: "customerID",
                    foreignField: "_id",
                    as: "customer",
                    preserveNull: true,
                },
                {
                    from: "contacts",
                    localField: "supplierID",
                    foreignField: "_id",
                    as: "supplier",
                    preserveNull: true,
                },
                {
                    from: "products",
                    localField: "productID",
                    foreignField: "_id",
                    as: "product",
                    preserveNull: true,
                },
            ],
            projection: {
                include: [
                    "customerID",
                    "supplierID",
                    "saleID",
                    "productID",
                    "batchID",
                    
                    "serial",
                    "salePrice",
                    "warranty",
                    "status",
                    "supplierAction",
                    "active",

                    "expireDate",
                    "claimDate",
                    "saleDate",
                    "sentDate",
                    "receivedDate",
                    "resolvedDate",

                    "replacedSerial",
                    "replacedBatchID",

                    "refundAmount",
                    "otherCost",

                    "createdAt",
                    "updatedAt",
                ],
                computed: {
                    customerName: "$customer.name",
                    supplierName: "$supplier.name",
                     productName: "$product.name",
                },
            },
        });
    }
}