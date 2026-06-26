import { ClientSession, Types } from "mongoose";
import { aggregateOne, paginatedAggregate } from "../../utils/queryBuilder";
import SaleQuotation from "./quotation.model";
import { CreateSaleQuotationInput } from "./quotation.type";

export default class QuotationRepository {
    static async createSaleQuotation(payload: any) {
        return await SaleQuotation.create(payload);
    }

    static async updateStatusOfSaleQuotation(
        quoteID: string,
        status: string,
        session?: ClientSession
    ) {
        return await SaleQuotation.findByIdAndUpdate(
            quoteID,
            { $set: { status } },
            {
                ...(session && { session }),
                new: true,
            }
        );
    }

    static async listOfSaleQuotation(query: any) {
        return await paginatedAggregate({
            model: SaleQuotation,
            query: query,
            postLookupSearch: true,
            searchFields: [
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
                include: ["totalAmount", "SaleDate", "deletable", "createdAt", "otherCost", "totalAmount", "discount", "totalProductPrice", "status"],
                computed: {
                    customerName: "$customer.name",
                },
            },
        })
    }
    static async getSaleQuotationByID(
        quoteID: string,
    ) {
        return await SaleQuotation.findById(
            quoteID
        );
    }

    static async getQuotationInvoice(
        quoteID: string,
    ) {
        return await aggregateOne(
            SaleQuotation,
            { _id: new Types.ObjectId(quoteID) },
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
                        balanceBefore: { $first: "$balanceBefore" },
                        balanceAfter: { $first: "$balanceAfter" },
                        SaleDate: { $first: "$SaleDate" },
                        status: { $first: "$status" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        products: { $push: "$products" },
                    },
                },
            ]
        );
    }

}