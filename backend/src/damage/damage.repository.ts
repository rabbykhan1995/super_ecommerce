import { ClientSession } from "mongoose";
import Damage from "./damage.model";
import { paginatedAggregate } from "../../utils/aggregationQueryBuilder";

export default class DamageRepository {
    static async insertMany(payload: any[], session?: ClientSession) {
        return await Damage.insertMany(
            payload,
            { session }
        );
    }

    static async list(query: any) {
        return await paginatedAggregate({
            model: Damage,
            query: query,

            postLookupSearch: true,

            searchFields: [
                { field: "reason" },
                { field: "note" },
                { field: "product.name" },
                { field: "batch.batchNo" },
            ],

            lookups: [
                {
                    from: "products",
                    localField: "productID",
                    foreignField: "_id",
                    as: "product",
                    preserveNull: true,
                },
                {
                    from: "batches",
                    localField: "batchID",
                    foreignField: "_id",
                    as: "batch",
                    preserveNull: true,
                },
            ],

            projection: {
                include: [
                    "damagedQty",
                    "purchasePrice",
                    "reason",
                    "serial",
                    "note",
                    "DamageDate",
                    "createdAt",
                    "deletable",
                    "batchID"
                ],

                computed: {
                    productName: {
                        $ifNull: ["$product.name", null],
                    },

                    batchNo: {
                        $ifNull: ["$batch.batchNo", null],
                    },

                    serial: {
                        $ifNull: ["$batch.serial", null],
                    },

                    totalLoss: {
                        $multiply: [
                            { $ifNull: ["$damagedQty", 0] },
                            { $ifNull: ["$purchasePrice", 0] },
                        ],
                    },
                }
            },
        });
    }

    static async delete(id:string, session?:ClientSession){
        return await Damage.findByIdAndDelete(id).session(session??null);
    }

    static async findByID(id:string,session?:ClientSession){
        return await Damage.findById(id).session(session??null);
    }

}