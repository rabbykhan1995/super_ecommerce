import { ClientSession, Types } from "mongoose";
import PurchaseCounter from "./purchaseCounter.model";
import { IPurchase, Purchase, PurchaseResponse } from "./purchase.type";
import Purchase from "./purchase.model";
import { aggregateOne, paginatedAggregate } from "../../utils/queryBuilder";

import { purchaseTable } from "./purchase.table";
import { eq } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";

export default class PurchaseRepository {
    static async getPurchaseInvoiceNo(session?: ClientSession): Promise<string> {
        const counter = await PurchaseCounter.findOneAndUpdate(
            {},
            { $inc: { counter: 1 } },
            { new: true, upsert: true, session }
        );
        return `INV-${counter!.counter}`;
    }

    static async purchaseCreate(
        payload: any,
        session?: ClientSession
    ): Promise<PurchaseResponse[]> {

        const purchase =
            await Purchase.create(
                [payload],
                { session }
            );

        return purchase;
    }

       static async findByID(
        purchaseID: number,
        client: QueryClient = db
    ): Promise<Purchase> {
        const [purchase] = await client
            .select()
            .from(purchaseTable)
            .where(eq(purchaseTable.id, purchaseID))
            .limit(1);

        return purchase
    }

    static async deletePurchaseByID(id: string, session?: ClientSession) {
        const formattedID = new Types.ObjectId(id)
        return await Purchase.findByIdAndDelete(formattedID, session ? { session } : undefined);

    }

    static async list(query: any) {

        return await paginatedAggregate({
            model: Purchase,
            query: query,
            postLookupSearch: true,
            searchFields: [
                { field: "invoiceNo" },
                { field: "supplier.name" },
                { field: "supplier.mobile" },
            ],
            lookups: [
                {
                    from: "contacts",
                    localField: "supplierID",
                    foreignField: "_id",
                    as: "supplier",
                    preserveNull: true,
                },
            ],
            projection: {
                include: ["invoiceNo", "totalAmount", "paid", "balanceAfter", "balanceBefore", "PurchaseDate", "deletable", "createdAt", "otherCost", "totalAmount", "discount"],
                computed: {
                    supplierName: "$supplier.name",
                },
            },
        });
    }
    // purchase.repository.ts
    // static async purchaseInvoiceByID(id: string) {

    //     return aggregateOne(
    //         Purchase,

    //         {
    //             _id: new Types.ObjectId(id)
    //         },

    //         [
    //             {
    //                 from: "contacts",
    //                 localField: "supplierID",
    //                 foreignField: "_id",
    //                 as: "supplier",
    //             },
    //         ],

    //         undefined,

    //         [
    //             // accounts lookup
    //             {
    //                 $lookup: {
    //                     from: "accounts",
    //                     localField: "accounts.accountID",
    //                     foreignField: "_id",
    //                     as: "accountDetails",
    //                 },
    //             },

    //             // amount + account name map
    //             {
    //                 $addFields: {
    //                     accounts: {
    //                         $map: {
    //                             input: "$accounts",
    //                             as: "acc",
    //                             in: {
    //                                 accountID: "$$acc.accountID",

    //                                 amount: "$$acc.amount",

    //                                 name: {
    //                                     $let: {
    //                                         vars: {
    //                                             matched: {
    //                                                 $first: {
    //                                                     $filter: {
    //                                                         input: "$accountDetails",
    //                                                         as: "ad",
    //                                                         cond: {
    //                                                             $eq: [
    //                                                                 "$$ad._id",
    //                                                                 "$$acc.accountID",
    //                                                             ],
    //                                                         },
    //                                                     },
    //                                                 },
    //                                             },
    //                                         },

    //                                         in: "$$matched.name",
    //                                     },
    //                                 },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },

    //             {
    //                 $project: {
    //                     accountDetails: 0,
    //                 },
    //             },
    //         ]
    //     );
    // }
    static async purchaseInvoiceByID(id: string) {
        return aggregateOne(
            Purchase,
            { _id: new Types.ObjectId(id) },
            [
                { from: "contacts", localField: "supplierID", foreignField: "_id", as: "supplier" },
            ],
            undefined,
            [
                // accounts name
                {
                    $lookup: {
                        from: "accounts",
                        localField: "accounts.accountID",
                        foreignField: "_id",
                        as: "accountDetails",
                    },
                },
                {
                    $addFields: {
                        accounts: {
                            $map: {
                                input: "$accounts",
                                as: "acc",
                                in: {
                                    accountID: "$$acc.accountID",
                                    amount: "$$acc.amount",
                                    name: {
                                        $let: {
                                            vars: {
                                                matched: {
                                                    $first: {
                                                        $filter: {
                                                            input: "$accountDetails",
                                                            as: "ad",
                                                            cond: { $eq: ["$$ad._id", "$$acc.accountID"] },
                                                        },
                                                    },
                                                },
                                            },
                                            in: "$$matched.name",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                { $project: { accountDetails: 0 } },

                // batches lookup
                {
                    $lookup: {
                        from: "batches",
                        localField: "_id",
                        foreignField: "purchaseID",
                        as: "batches",
                    },
                },

                // batches এর ভেতরে product, brand, unit, category
                {
                    $lookup: {
                        from: "products",
                        localField: "batches.productID",
                        foreignField: "_id",
                        as: "batchProducts",
                    },
                },
                {
                    $lookup: {
                        from: "brands",
                        localField: "batchProducts.brandID",
                        foreignField: "_id",
                        as: "batchBrands",
                    },
                },
                {
                    $lookup: {
                        from: "units",
                        localField: "batchProducts.unitID",
                        foreignField: "_id",
                        as: "batchUnits",
                    },
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "batchProducts.categoryID",
                        foreignField: "_id",
                        as: "batchCategories",
                    },
                },
                {
                    $addFields: {
                        batches: {
                            $map: {
                                input: "$batches",
                                as: "b",
                                in: {
                                    _id: "$$b._id",
                                    serial: "$$b.serial",
                                    warranty: "$$b.warranty",
                                    purchasedQty: "$$b.purchasedQty",
                                    remainingQty: "$$b.remainingQty",
                                    returnedQty: "$$b.returnedQty",
                                    purchasePrice: "$$b.purchasePrice",
                                    salePrice: "$$b.salePrice",
                                    expireDate: "$$b.expireDate",
                                    product: {
                                        $let: {
                                            vars: {
                                                prod: {
                                                    $first: {
                                                        $filter: {
                                                            input: "$batchProducts",
                                                            as: "bp",
                                                            cond: { $eq: ["$$bp._id", "$$b.productID"] },
                                                        },
                                                    },
                                                },
                                            },
                                            in: {
                                                _id: "$$prod._id",
                                                name: "$$prod.name",
                                                thumbnail: "$$prod.thumbnail",
                                                brand: {
                                                    name: {
                                                        $let: {
                                                            vars: {
                                                                matched: {
                                                                    $first: {
                                                                        $filter: {
                                                                            input: "$batchBrands",
                                                                            as: "br",
                                                                            cond: { $eq: ["$$br._id", "$$prod.brandID"] },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            in: "$$matched.name",
                                                        },
                                                    },
                                                },
                                                unit: {
                                                    name: {
                                                        $let: {
                                                            vars: {
                                                                matched: {
                                                                    $first: {
                                                                        $filter: {
                                                                            input: "$batchUnits",
                                                                            as: "u",
                                                                            cond: { $eq: ["$$u._id", "$$prod.unitID"] },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            in: "$$matched.name",
                                                        },
                                                    },
                                                },
                                                category: {
                                                    name: {
                                                        $let: {
                                                            vars: {
                                                                matched: {
                                                                    $first: {
                                                                        $filter: {
                                                                            input: "$batchCategories",
                                                                            as: "c",
                                                                            cond: { $eq: ["$$c._id", "$$prod.categoryID"] },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            in: "$$matched.name",
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                { $project: { batchProducts: 0, batchBrands: 0, batchUnits: 0, batchCategories: 0 } },
            ]
        );
    }
    // batch.repository.ts

    // static async purchaseBatches(
    //     purchaseID: string
    // ) {

    //     return Batch.aggregate([
    //         {
    //             $match: {
    //                 purchaseID: new Types.ObjectId(purchaseID),
    //             },
    //         },

    //         {
    //             $lookup: {
    //                 from: "products",
    //                 localField: "productID",
    //                 foreignField: "_id",
    //                 as: "product",
    //             },
    //         },

    //         {
    //             $addFields: {
    //                 product: {
    //                     $first: "$product",
    //                 },
    //             },
    //         },

    //         {
    //             $lookup: {
    //                 from: "brands",
    //                 localField: "product.brandID",
    //                 foreignField: "_id",
    //                 as: "product.brand",
    //             },
    //         },

    //         {
    //             $addFields: {
    //                 "product.brand": {
    //                     $first: "$product.brand",
    //                 },
    //             },
    //         },

    //         {
    //             $lookup: {
    //                 from: "units",
    //                 localField: "product.unitID",
    //                 foreignField: "_id",
    //                 as: "product.unit",
    //             },
    //         },

    //         {
    //             $addFields: {
    //                 "product.unit": {
    //                     $first: "$product.unit",
    //                 },
    //             },
    //         },

    //         {
    //             $lookup: {
    //                 from: "categories",
    //                 localField: "product.categoryID",
    //                 foreignField: "_id",
    //                 as: "product.category",
    //             },
    //         },

    //         {
    //             $addFields: {
    //                 "product.category": {
    //                     $first: "$product.category",
    //                 },
    //             },
    //         },

    //         {
    //             $project: {
    //                 serial: 1,
    //                 warranty: 1,
    //                 purchasedQty: 1,
    //                 purchasePrice: 1,
    //                 purchaseDate: 1,

    //                 "product._id": 1,
    //                 "product.name": 1,
    //                 "product.thumbnail": 1,

    //                 "product.brand.name": 1,
    //                 "product.unit.name": 1,
    //                 "product.category.name": 1,
    //             },
    //         },
    //     ]);
    // }
    static async purchaseUpdateDynamic(
        id: string,
        payload: Partial<IPurchase>,
        session?: ClientSession
    ): Promise<PurchaseResponse | null> {
        return Purchase.findByIdAndUpdate(
            new Types.ObjectId(id),
            { $set: payload },
            {
                new: true,
                session,
            }
        );
    }

 
}