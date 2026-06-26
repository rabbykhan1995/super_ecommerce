import { ClientSession, Types } from "mongoose";
import Sale from "./sale.model";
import { aggregateOne, paginatedAggregate } from "../../utils/queryBuilder";

export default class SaleRepository {
    static async getSaleByID(id: string) {
        return await Sale.findById(new Types.ObjectId(id));
    }

    static async create(payload: any, session?: ClientSession) {
        return await Sale.create(payload, { session });
    }

    static async list(query: any) {
        return await paginatedAggregate({
            model: Sale,
            query: query,
            postLookupSearch: true,
            searchFields: [
                { field: "invoiceNo" },
                { field: "customer.name" },
                { field: "customer.mobile" },
            ],
            lookups: [
                {
                    from: "contacts",
                    localField: "customerID",
                    foreignField: "_id",
                    as: "customer",
                    preserveNull: true,
                },
            ],
            projection: {
                include: ["invoiceNo", "totalAmount", "paid", "balanceAfter", "balanceBefore", "SaleDate", "deletable", "createdAt", "otherCost", "totalAmount", "discount", "exchangeAmount"],
                computed: {
                    customerName: "$customer.name",
                },
            },
        })
    }

   static async saleInvoiceByID(id: string) {
    return await aggregateOne(
        Sale,
        { _id: new Types.ObjectId(id) },
        [
            {
                from: "contacts",
                localField: "customerID",
                foreignField: "_id",
                as: "customer",
            },
        ],
        undefined,
        [
            // =========================
            // ACCOUNTS LOOKUP
            // =========================
            {
                $lookup: {
                    from: "accounts",
                    localField: "accounts.accountID",
                    foreignField: "_id",
                    as: "accountDetails",
                },
            },

            // =========================
            // MAP ACCOUNTS
            // =========================
            {
                $addFields: {
                    accounts: {
                        $map: {
                            input: { $ifNull: ["$accounts", []] },
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

            // =========================
            // MAP EXCHANGE ACCOUNTS (NEW)
            // =========================
            {
                $addFields: {
                    exchangeAccounts: {
                        $map: {
                            input: { $ifNull: ["$exchangeAccounts", []] },
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

            // remove only internal helper
            {
                $project: {
                    accountDetails: 0,
                },
            },

            // =========================
            // PRODUCTS UNWIND
            // =========================
            { $unwind: "$products" },

            // =========================
            // BATCH LOOKUP
            // =========================
            {
                $lookup: {
                    from: "batches",
                    localField: "products.batchID",
                    foreignField: "_id",
                    as: "batch",
                },
            },
            { $addFields: { batch: { $first: "$batch" } } },

            // =========================
            // PRODUCT LOOKUP
            // =========================
            {
                $lookup: {
                    from: "products",
                    localField: "products.productID",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            { $addFields: { productDetails: { $first: "$productDetails" } } },

            // =========================
            // UNIT / BRAND / CATEGORY
            // =========================
            {
                $lookup: {
                    from: "units",
                    localField: "productDetails.unitID",
                    foreignField: "_id",
                    as: "unit",
                },
            },
            { $addFields: { unit: { $first: "$unit" } } },

            {
                $lookup: {
                    from: "brands",
                    localField: "productDetails.brandID",
                    foreignField: "_id",
                    as: "brand",
                },
            },
            { $addFields: { brand: { $first: "$brand" } } },

            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.categoryID",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $addFields: { category: { $first: "$category" } } },

            // =========================
            // SHAPE PRODUCTS
            // =========================
            {
                $addFields: {
                    products: {
                        batchID: "$products.batchID",
                        productID: "$products.productID",
                        soldQty: "$products.soldQty",
                        salePrice: "$products.salePrice",
                        warranty: "$products.warranty",

                        serial: "$batch.serial",
                        purchasePrice: "$batch.purchasePrice",
                        purchasedQty: "$batch.purchasedQty",

                        product: {
                            _id: "$productDetails._id",
                            name: "$productDetails.name",
                            thumbnail: "$productDetails.thumbnail",
                            brand: { name: "$brand.name" },
                            unit: { name: "$unit.name" },
                            category: { name: "$category.name" },
                        },
                    },
                },
            },

            // =========================
            // GROUP BACK
            // =========================
            {
                $group: {
                    _id: "$_id",
                    invoiceNo: { $first: "$invoiceNo" },
                    customer: { $first: "$customer" },
                    customerID: { $first: "$customerID" },
                    note: { $first: "$note" },
                    costName: { $first: "$costName" },
                    deletable: { $first: "$deletable" },

                    totalProductPrice: { $first: "$totalProductPrice" },
                    otherCost: { $first: "$otherCost" },
                    discount: { $first: "$discount" },
                    totalAmount: { $first: "$totalAmount" },

                    paid: { $first: "$paid" },
                    exchangeAmount: { $first: "$exchangeAmount" },

                    balanceBefore: { $first: "$balanceBefore" },
                    balanceAfter: { $first: "$balanceAfter" },

                    accounts: { $first: "$accounts" },
                    exchangeAccounts: { $first: "$exchangeAccounts" },

                    SaleDate: { $first: "$SaleDate" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },

                    products: { $push: "$products" },
                },
            },
        ]
    );
}


    static async findAndUpdateByID(
        id: string,
        update: Record<string, any>,
        session?: ClientSession
    ) {
        return Sale.findByIdAndUpdate(
            id,
            update,
            {
                new: true,
                ...(session ? { session } : {}),
            }
        );
    }
}