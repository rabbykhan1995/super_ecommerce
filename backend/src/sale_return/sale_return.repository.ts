import { ClientSession, Types } from "mongoose";
import SaleReturn from "./sale_return.model";
import { CreateSaleReturnInput, SaleReturnDetail } from "./sale_return.type";


export default class SaleReturnRepository {
  static async create(
    payload: any,
    session?: ClientSession
  ) {
    const created = await SaleReturn.create(
      [payload],
      {
        ...(session ? { session } : {}),
      }
    );

    return created[0];
  }

  static async list(query: any) {
    // return await paginatedAggregate({
    //   model: SaleReturn,
    //   query: query,
    //   postLookupSearch: true,
    //   searchFields: [
    //     { field: "invoiceNo" },
    //     { field: "customer.name" },
    //     { field: "customer.mobile" },
    //   ],
    //   lookups: [
    //     {
    //       from: "contacts",
    //       localField: "customerID",
    //       foreignField: "_id",
    //       as: "customer",
    //       preserveNull: true,
    //     },
    //     {
    //       from: "sales",
    //       localField: "saleID",
    //       foreignField: "_id",
    //       as: "sale",
    //       preserveNull: true,
    //     },
    //   ],
    //   projection: {
    //     include: [
    //       "invoiceNo",
    //       "totalAmount",
    //       "paid",
    //       "balanceBefore",
    //       "balanceAfter",
    //       "discount",
    //       "date",
    //       "status",
    //       "createdAt",
    //     ],
    //     computed: {
    //       customerName: "$customer.name",
    //       purchaseInvoiceNo: "$sale.invoiceNo",
    //     },
    //   },
    // })
  }

  static async findById(id: string) {
    return await SaleReturn.findById(id);
  }

  static async delete(id: string, session?: ClientSession) {
    await SaleReturn.findByIdAndDelete(id, {
      ...(session ? { session } : {}),
    });
  }

  static async countOtherSaleReturns(
    saleID: string,
    excludeId: string,
    session?: ClientSession
  ): Promise<number> {
    return SaleReturn.countDocuments({
      saleID,
      _id: { $ne: excludeId },
    }).session(session ?? null);
  }

  static async saleReturnInvoiceByID(id: string) {
    // return await aggregateOne<SaleReturnDetail>(
    //   SaleReturn,
    //   { _id: new Types.ObjectId(id) },
    //   [
    //     { from: "contacts", localField: "customerID", foreignField: "_id", as: "customer" },
    //     { from: "sales", localField: "saleID", foreignField: "_id", as: "sale" },
    //   ],
    //   undefined,
    //   [
    //     // account names
    //     {
    //       $lookup: {
    //         from: "accounts",
    //         localField: "accounts.accountID",
    //         foreignField: "_id",
    //         as: "accountDetails",
    //       },
    //     },
    //     {
    //       $addFields: {
    //         accounts: {
    //           $map: {
    //             input: "$accounts",
    //             as: "acc",
    //             in: {
    //               accountID: "$$acc.accountID",
    //               amount: "$$acc.amount",
    //               name: {
    //                 $let: {
    //                   vars: {
    //                     matched: {
    //                       $first: {
    //                         $filter: {
    //                           input: "$accountDetails",
    //                           as: "ad",
    //                           cond: { $eq: ["$$ad._id", "$$acc.accountID"] },
    //                         },
    //                       },
    //                     },
    //                   },
    //                   in: "$$matched.name",
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       $addFields: {
    //         customer: { $first: "$customer" },
    //         sale: { $first: "$sale" },
    //       },
    //     },
    //     { $project: { accountDetails: 0 } },

    //     // products unwind
    //     { $unwind: "$products" },

    //     // batch
    //     {
    //       $lookup: {
    //         from: "batches",
    //         localField: "products.batchID",
    //         foreignField: "_id",
    //         as: "batch",
    //       },
    //     },
    //     { $addFields: { batch: { $first: "$batch" } } },

    //     // product
    //     {
    //       $lookup: {
    //         from: "products",
    //         localField: "products.productID",
    //         foreignField: "_id",
    //         as: "productDetails",
    //       },
    //     },
    //     { $addFields: { productDetails: { $first: "$productDetails" } } },

    //     // unit
    //     {
    //       $lookup: {
    //         from: "units",
    //         localField: "productDetails.unitID",
    //         foreignField: "_id",
    //         as: "unit",
    //       },
    //     },
    //     { $addFields: { unit: { $first: "$unit" } } },

    //     // brand
    //     {
    //       $lookup: {
    //         from: "brands",
    //         localField: "productDetails.brandID",
    //         foreignField: "_id",
    //         as: "brand",
    //       },
    //     },
    //     { $addFields: { brand: { $first: "$brand" } } },

    //     // category
    //     {
    //       $lookup: {
    //         from: "categories",
    //         localField: "productDetails.categoryID",
    //         foreignField: "_id",
    //         as: "category",
    //       },
    //     },
    //     { $addFields: { category: { $first: "$category" } } },

    //     // reshape product
    //     {
    //       $addFields: {
    //         products: {
    //           batchID: "$products.batchID",
    //           productID: "$products.productID",
    //           returnedQty: "$products.returnedQty",
    //           returnPrice: "$products.returnPrice",

    //           serial: "$batch.serial",
    //           purchasePrice: "$batch.purchasePrice",
    //           purchasedQty: "$batch.purchasedQty",

    //           product: {
    //             _id: "$productDetails._id",
    //             name: "$productDetails.name",
    //             thumbnail: "$productDetails.thumbnail",

    //             brand: {
    //               name: "$brand.name",
    //             },

    //             unit: {
    //               name: "$unit.name",
    //             },

    //             category: {
    //               name: "$category.name",
    //             },
    //           },
    //         },
    //       },
    //     },

    //     // regroup
    //     {
    //       $group: {
    //         _id: "$_id",

    //         invoiceNo: { $first: "$invoiceNo" },
    //         saleID: { $first: "$saleID" },
    //         sale: { $first: "$sale" },

    //         customerID: { $first: "$customerID" },
    //         customer: { $first: "$customer" },

    //         note: { $first: "$note" },

    //         totalAmount: { $first: "$totalAmount" },
    //         paid: { $first: "$paid" },

    //         balanceBefore: { $first: "$balanceBefore" },
    //         balanceAfter: { $first: "$balanceAfter" },

    //         accounts: { $first: "$accounts" },

    //         returnDate: { $first: "$returnDate" },

    //         createdAt: { $first: "$createdAt" },
    //         updatedAt: { $first: "$updatedAt" },

    //         products: {
    //           $push: "$products",
    //         },
    //       },
    //     },
    //   ]
    // );
  }
}