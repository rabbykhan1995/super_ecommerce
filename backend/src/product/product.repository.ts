import { ClientSession, Types } from "mongoose";
import Batch from "./batch.model";
import Product from "./product.model";
import { BatchResponse, CreateProductInput, IBatch, ProductResponse, UpdateProductInput } from "./product.type";
import { aggregateOne, paginatedAggregate } from "../../utils/queryBuilder";
import { SaleProduct, SaleResponse } from "../sale/sale.type";

export default class ProductRepository {
    static async findByField(
        fieldName: keyof ProductResponse,
        fieldVal: any
    ): Promise<ProductResponse | null> {

        return Product.findOne({ [fieldName]: fieldVal });
    }
    static async findManyByField(
        fieldName: keyof ProductResponse,
        fieldVal: any
    ): Promise<ProductResponse[]> {
        return Product.find({ [fieldName]: fieldVal });
    }
    static async findByID(id: string, session?: ClientSession): Promise<ProductResponse | null> {
        return Product.findById(new Types.ObjectId(id)).session(session ?? null);
    }

    static async findBatchByID(id: string, session?: ClientSession): Promise<BatchResponse | null> {
        return Batch.findById(new Types.ObjectId(id)).session(session ?? null);
    }

    static async findOneBatch(
        filter: Record<string, any>,
        session?: ClientSession
    ) {
        return await Batch.findOne(filter).sort({ PurchaseDate: 1 }).session(session || null);
    }
    static async createProduct(
        payload: CreateProductInput
    ): Promise<ProductResponse | null> {

        return Product.create(payload);
    }

    static async createBatch(
        payload: any
    ): Promise<BatchResponse> {

        return Batch.create(payload);
    }

    static async createBatches(
        payloads: any[],
        session?: ClientSession
    ): Promise<BatchResponse[]> {

        return Batch.insertMany(
            payloads,
            {
                session,
                ordered: true,
            }
        );
    }

    static async updateProduct(id: string,
        payload: UpdateProductInput
    ): Promise<ProductResponse | null> {

        return Product.findByIdAndUpdate(id, payload, { new: true });
    }

    static async FullStructuredProductByID(id: string
    ): Promise<any | null> {

        const product = await aggregateOne(
            Product,
            { _id: new Types.ObjectId(id as string) },
            [
                { from: "brands", localField: "brandID", foreignField: "_id", as: "brand" },
                { from: "units", localField: "unitID", foreignField: "_id", as: "unit" },
                { from: "categories", localField: "categoryID", foreignField: "_id", as: "category" },
            ],
        );

        return product;
    }
    static async productByBarcode(barcode: any
    ): Promise<any | null> {

        const product = await aggregateOne(
            Product,
            { barcode: barcode as string },
            [
                { from: "brands", localField: "brandID", foreignField: "_id", as: "brand" },
                { from: "units", localField: "unitID", foreignField: "_id", as: "unit" },
                { from: "categories", localField: "categoryID", foreignField: "_id", as: "category" },
            ],
        );

        return product;
    }

    static async batchByProductID(
        productID: string
    ): Promise<BatchResponse[] | null> {

        const batches = await Batch.find({
            productID: new Types.ObjectId(productID as string),
            isActive: true,
            remainingQty: { $gt: 0 },
        }).sort({ PurchaseDate: 1 });

        return batches;
    }

    static async serialByProductID(
        productID: string
    ): Promise<BatchResponse[] | null> {

        const serials = await Batch.find({
            productID: new Types.ObjectId(productID as string),
            isActive: true,
            serial: { $exists: true, $ne: null }, // ✅ serial আছে এবং null না
            remainingQty: { $gt: 0 },
        })

        return serials;
    }

    static async findBatchBySerial(
        query: any
    ): Promise<BatchResponse | null> {

        const batch = await Batch.findOne(query);

        return batch;
    }

    static async list(
        query: any
    ) {

        const result = await paginatedAggregate({
            model: Product,
            query: query,
            searchFields: [{ field: "name" }],

            lookups: [
                {
                    from: "brands",
                    localField: "brandID",
                    foreignField: "_id",
                    as: "brand",
                    preserveNull: true,
                },
                {
                    from: "units",
                    localField: "unitID",
                    foreignField: "_id",
                    as: "unit",
                    preserveNull: true,
                },
                {
                    from: "categories",
                    localField: "categoryID",
                    foreignField: "_id",
                    as: "category",
                    preserveNull: true,
                },
            ],
            projection: {
                include: ["name", "barcode", "thumbnail", "stock", "manageStock", "manageWarranty", "decimal", "createdAt", "purchasePrice", "salePrice", "posEnabled"],
                computed: {
                    brandName: "$brand.name",
                    unitName: "$unit.name",
                    categoryName: "$category.name",
                },
            },
        });

        return result;
    }

    static async findSaleBatches(
        productID: string
    ) {
        const formattedID = new Types.ObjectId(productID)
        return Batch.find({
            productID: formattedID,
            isActive: true,
            serial: null,
            remainingQty: { $gt: 0 },
        }).lean();

    }

    static async findSaleReturnBatches(batchIDs: SaleProduct[], sale: SaleResponse) {

        const ids = batchIDs.map(x => x.batchID);

        const batches = await Batch.aggregate([
            {
                $match: {
                    _id: { $in: ids },
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
            // sale এর soldQty যোগ করো
            {
                $addFields: {
                    soldInfo: {
                        $first: {
                            $filter: {
                                input: sale.products,
                                as: "sp",
                                cond: { $eq: ["$$sp.batchID", "$_id"] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: "$product.name",
                    unitName: { $first: "$unit.name" },
                    brandName: { $first: "$brand.name" },
                    categoryName: { $first: "$category.name" },
                    salePrice: "$soldInfo.salePrice", // sale এর actual salePrice
                    saleReturnedQty: 1,
                    soldQty: "$soldInfo.soldQty",     // sale এ কতটা বিক্রি হয়েছিল
                    remainingQty: 1,
                    purchasedQty: 1,
                    warranty: 1,
                    manageWarranty: { $gt: ["$warranty", 0] },
                    serial: 1,
                }
            }
        ]);
        return batches;
    }

    static async findSaleSerials(
        productID: string
    ) {
        const formattedID = new Types.ObjectId(productID)
        return Batch.find({
            productID: formattedID,
            isActive: true,
            serial: {
                $ne: null,
                $exists: true,
            },
            remainingQty: { $gt: 0 },
        }).lean();
    }

    static async increaseProductStock(
        productID: Types.ObjectId,
        qty: number,
        session?: ClientSession
    ) {

        return Product.findByIdAndUpdate(
            productID,
            {
                $inc: { stock: qty },
            },
            { session, new: true }
        );
    }

    static async decreaseProductStock(
        productID: Types.ObjectId,
        qty: number,
        session?: ClientSession
    ) {

        return Product.findByIdAndUpdate(
            productID,
            {
                $inc: { stock: -qty },
            },
            { session, new: true }
        );
    }

    static async updateProductFifoBatchAndStock(
        productID: string,
        options: {
            fifoBatchID?: string;
            qty?: number;
            salePrice?: number;
            purchasePrice?: number;
        },
        session?: ClientSession
    ) {
        const update: any = {};

        if (options.fifoBatchID !== undefined) {
            update.fifoBatchID = options.fifoBatchID;
        }

        if (options.salePrice !== undefined) {
            update.salePrice = options.salePrice;
        }

        if (options.purchasePrice !== undefined) {
            update.purchasePrice = options.purchasePrice;
        }

        if (options.qty !== undefined) {
            update.$inc = {
                stock: options.qty
            };
        }

        return Product.findByIdAndUpdate(
            productID,
            update,
            {
                session,
                new: true
            }
        );
    }
    static async updateBatchDynamically(
        batchID: string,
        options: {
            set?: Partial<IBatch>;
            inc?: Partial<Record<keyof IBatch, number>>;
        },
        session?: ClientSession
    ) {
        return Batch.findByIdAndUpdate(
            new Types.ObjectId(batchID),
            {
                ...(options.set ? { $set: options.set } : {}),
                ...(options.inc ? { $inc: options.inc } : {}),
            },
            { new: true, ...(session ? { session } : {}) }
        );
    }
    static async deductStockFromBatch(
        batchID: Types.ObjectId,
        qty: number,
        session?: ClientSession
    ) {
        return Batch.findByIdAndUpdate(
            batchID,
            {
                $inc: {
                    remainingQty: -qty,
                    soldQty: qty,
                },
            },
            {
                session,
                new: true,
            }
        );
    }

    static async returnStockToBatch(
        batchID: Types.ObjectId,
        qty: number,
        session?: ClientSession
    ) {
        return Batch.findByIdAndUpdate(
            batchID,
            {
                $inc: {
                    remainingQty: qty,
                    soldQty: -qty,
                },
                isActive: true,
            },
            {
                session,
                new: true,
            }
        );
    }


    static async findBatches(
        filter: Record<string, any>,
        session?: ClientSession
    ): Promise<BatchResponse[]> {

        return Batch.find(filter).sort({ PurchaseDate: 1 }).session(session || null);
    }

    static async deleteBatches(
        filter: Record<string, any>,
        session?: ClientSession
    ) {

        return Batch.deleteMany(filter, session ? { session } : undefined);
    }

    static async countProduct(filters: CountProductFilters) {
  const conditions = [];

  if (filters.brandID) {
    conditions.push(eq(productTable.brandID, filters.brandID));
  }

  if (filters.categoryID) {
    conditions.push(eq(productTable.categoryID, filters.categoryID));
  }

  if (filters.unitID) {
    conditions.push(eq(productTable.unitID, filters.unitID));
  }

  const result = await db
    .select({ count: count() })
    .from(productTable)
    .where(
      conditions.length > 0
        ? and(...conditions)
        : undefined
    );

  return result[0].count;
}

}



// static async saleReturnByID(req: Request, res: Response) {
//   const { id } = req.params;



//   const saleReturn = await aggregateOne<SaleReturnDetail>(
//     SaleReturn,
//     { _id: new Types.ObjectId(id as string) },
//     [
//       { from: "contacts", localField: "customerID", foreignField: "_id", as: "customer" },
//       { from: "sales", localField: "saleID", foreignField: "_id", as: "sale" },
//     ],
//     undefined,
//     [
//       {
//         $lookup: {
//           from: "accounts",
//           localField: "accounts.accountID",
//           foreignField: "_id",
//           as: "accountDetails",
//         },
//       },
//       {
//         $addFields: {
//           accounts: {
//             $map: {
//               input: "$accounts",
//               as: "acc",
//               in: {
//                 accountID: "$$acc.accountID",
//                 amount: "$$acc.amount",
//                 name: {
//                   $let: {
//                     vars: {
//                       matched: {
//                         $first: {
//                           $filter: {
//                             input: "$accountDetails",
//                             as: "ad",
//                             cond: { $eq: ["$$ad._id", "$$acc.accountID"] },
//                           },
//                         },
//                       },
//                     },
//                     in: "$$matched.name",
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//       { $project: { accountDetails: 0 } },
//     ]
//   );

//   if (!saleReturn) throw new ApiError(404, "Sale return not found");

//   const batches = await Batch.aggregate([
//     {
//       $match: {
//         _id: {
//           $in: saleReturn.batches.map((b) => new Types.ObjectId(b.batchID.toString()))
//         }
//       }
//     },
//     {
//       $lookup: {
//         from: "products",
//         localField: "productID",
//         foreignField: "_id",
//         as: "product",
//       },
//     },
//     { $addFields: { product: { $first: "$product" } } },
//     {
//       $lookup: {
//         from: "brands",
//         localField: "product.brandID",
//         foreignField: "_id",
//         as: "product.brand",
//       },
//     },
//     { $addFields: { "product.brand": { $first: "$product.brand" } } },
//     {
//       $lookup: {
//         from: "units",
//         localField: "product.unitID",
//         foreignField: "_id",
//         as: "product.unit",
//       },
//     },
//     { $addFields: { "product.unit": { $first: "$product.unit" } } },
//     {
//       $lookup: {
//         from: "categories",
//         localField: "product.categoryID",
//         foreignField: "_id",
//         as: "product.category",
//       },
//     },
//     { $addFields: { "product.category": { $first: "$product.category" } } },
//     {
//       $addFields: {
//         returnInfo: {
//           $first: {
//             $filter: {
//               input: saleReturn.batches.map((b) => ({
//                 batchID: new Types.ObjectId(b.batchID.toString()),
//                 saleReturnedQty: b.saleReturnedQty,
//                 reason: b.reason,
//               })),
//               as: "rb",
//               cond: { $eq: ["$$rb.batchID", "$_id"] },
//             },
//           },
//         },
//       },
//     },
//     {
//       $project: {
//         serial: 1,
//         warranty: 1,
//         purchasedQty: 1,
//         remainingQty: 1,
//         purchasePrice: 1,
//         saleReturnedQty: "$returnInfo.saleReturnedQty",
//         reason: "$returnInfo.reason",
//         "product._id": 1,
//         "product.name": 1,
//         "product.thumbnail": 1,
//         "product.brand.name": 1,
//         "product.unit.name": 1,
//         "product.category.name": 1,
//       },
//     },
//   ]);

//   res.status(200).json({ success: true, data: { ...saleReturn, batches } });
// }