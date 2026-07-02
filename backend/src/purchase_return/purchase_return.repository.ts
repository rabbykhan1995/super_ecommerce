import { ClientSession, Types } from "mongoose";


export default class PurchaseReturnRepository {
    static async createPurchaseReturn(payload: any, session?: ClientSession) {
        const [doc] = await PurchaseReturn.create([payload], {
            session: session ?? null,
        });
        return doc;
    }

    static async deletePurchaseReturn(id: string, session?: ClientSession) {
    await PurchaseReturn.findByIdAndDelete(id, {
      ...(session ? { session } : {}),
    });
  }

    static async list(query: any) {
        return await paginatedAggregate({
            model: PurchaseReturn,
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
                {
                    from: "purchases",
                    localField: "purchaseID",
                    foreignField: "_id",
                    as: "purchase",
                    preserveNull: true,
                },
            ],
            projection: {
                include: [
                    "invoiceNo",
                    "totalAmount",
                    "paid",
                    "balanceBefore",
                    "balanceAfter",
                    "discount",
                    "date",
                    "status",
                    "createdAt",
                ],
                computed: {
                    supplierName: "$supplier.name",
                    purchaseInvoiceNo: "$purchase.invoiceNo",
                },
            },
        });
    }

    static async purchaseReturnInvoiceByID(id: string) {
        return await aggregateOne(
            PurchaseReturn,
            { _id: new Types.ObjectId(id) },
            [
                {
                    from: "contacts",
                    localField: "supplierID",
                    foreignField: "_id",
                    as: "supplier",
                },
                {
                    from: "purchases",
                    localField: "purchaseID",
                    foreignField: "_id",
                    as: "purchase",
                },
            ],
            undefined,
            [
                // accounts lookup + name map
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
                                                            cond: {
                                                                $eq: ["$$ad._id", "$$acc.accountID"],
                                                            },
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

                // batches lookup (like purchase invoice style)
                {
                    $lookup: {
                        from: "batches",
                        localField: "batches.batchID",
                        foreignField: "_id",
                        as: "batchDetails",
                    },
                },

                // products for batches
                {
                    $lookup: {
                        from: "products",
                        localField: "batchDetails.productID",
                        foreignField: "_id",
                        as: "products",
                    },
                },
                {
                    $lookup: {
                        from: "brands",
                        localField: "products.brandID",
                        foreignField: "_id",
                        as: "brands",
                    },
                },
                {
                    $lookup: {
                        from: "units",
                        localField: "products.unitID",
                        foreignField: "_id",
                        as: "units",
                    },
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "products.categoryID",
                        foreignField: "_id",
                        as: "categories",
                    },
                },

                // reshape batches
                {
                    $addFields: {
                        batches: {
                            $map: {
                                input: "$batches",
                                as: "b",
                                in: {
                                    batchID: "$$b.batchID",
                                    purchaseReturnedQty: "$$b.purchaseReturnedQty",
                                    reason: "$$b.reason",

                                    serial: {
                                        $let: {
                                            vars: {
                                                batch: {
                                                    $first: {
                                                        $filter: {
                                                            input: "$batchDetails",
                                                            as: "bd",
                                                            cond: {
                                                                $eq: ["$$bd._id", "$$b.batchID"],
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                            in: "$$batch.serial",
                                        },
                                    },

                                    product: {
                                        $let: {
                                            vars: {
                                                batch: {
                                                    $first: {
                                                        $filter: {
                                                            input: "$batchDetails",
                                                            as: "bd",
                                                            cond: {
                                                                $eq: ["$$bd._id", "$$b.batchID"],
                                                            },
                                                        },
                                                    },
                                                },
                                                prod: {
                                                    $first: {
                                                        $filter: {
                                                            input: "$products",
                                                            as: "p",
                                                            cond: {
                                                                $eq: ["$$p._id", "$$batch.productID"],
                                                            },
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
                                                                            input: "$brands",
                                                                            as: "br",
                                                                            cond: {
                                                                                $eq: ["$$br._id", "$$prod.brandID"],
                                                                            },
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
                                                                            input: "$units",
                                                                            as: "u",
                                                                            cond: {
                                                                                $eq: ["$$u._id", "$$prod.unitID"],
                                                                            },
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
                                                                            input: "$categories",
                                                                            as: "c",
                                                                            cond: {
                                                                                $eq: ["$$c._id", "$$prod.categoryID"],
                                                                            },
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

                {
                    $project: {
                        batchDetails: 0,
                        products: 0,
                        brands: 0,
                        units: 0,
                        categories: 0,
                    },
                },
            ]
        );
    }

    static async getPurchaseReturnBatches(purchaseID: string) {

        // এই purchaseID দিয়ে batch আছে কিনা
        return await Batch.aggregate([
            {
                $match: {
                    purchaseID: new Types.ObjectId(purchaseID as string),
                    remainingQty: { $gt: 0 } // returnable only
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productID",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $addFields: { product: { $first: "$product" } } },
            {
                $lookup: {
                    from: "units",
                    localField: "product.unitID",
                    foreignField: "_id",
                    as: "unit",
                },
            },
            {
                $lookup: {
                    from: "brands",
                    localField: "product.brandID",
                    foreignField: "_id",
                    as: "brand",
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.categoryID",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $project: {
                    _id: 1,
                    name: "$product.name",
                    stock: "$remainingQty",
                    unitName: { $first: "$unit.name" },
                    brandName: { $first: "$brand.name" },
                    categoryName: { $first: "$category.name" },
                    purchasePrice: 1,
                    purchaseReturnedQty: 1,
                    purchasedQty: 1,
                    remainingQty: 1,
                    warranty: 1,
                    manageWarranty: { $gt: ["$warranty", 0] },
                    serial: 1,
                }
            }
        ]);


    }

    static async purchaseReturnByID(id: string) {
        return await PurchaseReturn.findById(id);
    }

    static async countOtherPurchaseReturns(
        purchaseID: string,
        excludeId: string,
        session?: ClientSession
    ): Promise<number> {
        return PurchaseReturn.countDocuments({
            purchaseID,
            _id: { $ne: excludeId },
        }).session(session ?? null);
    }
}