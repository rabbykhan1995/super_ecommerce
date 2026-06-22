import { ClientSession } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import Helper from "../../utils/helper";
import ProductRepository from "./product.repository";
import { BatchResponse, CreateProductInput, IBatch, ProductResponse, UpdateProductInput } from "./product.type";
import { SaleProduct, SaleResponse } from "../sale/sale.type";


export default class ProductService {
    static async create(
        payload: CreateProductInput
    ) {
        let exist = await ProductRepository.findByField("name", payload.name);

        if (exist) {
            throw new ApiError(400, "Product already exists with this name");
        }


        if (payload.barcode) {
            exist = await ProductRepository.findByField("barcode", payload.barcode);

            if (exist) {
                throw new ApiError(400, "Product already exists with this barcode");
            }
        }

        const product = await ProductRepository.createProduct(payload);

        if (!product) {
            throw new ApiError(401, "Product Creation failed");
        }

        if (
            product.manageStock &&
            payload.stock &&
            payload.stock > 0
        ) {

            const batch = await ProductRepository.createBatch({
                productID: product._id,
                // opening stock, no purchase yet
                purchaseID: null,
                purchasedQty: payload.stock,
                remainingQty: payload.stock,
                purchasePrice: payload.purchasePrice || 0,
                salePrice: payload.salePrice || 0,
                isActive: true,
            });



            // set fifo batch
            product.fifoBatchID = batch._id as any;
            await product.save();
        }
    }

    static async update(
        id: string, payload: UpdateProductInput
    ) {
        let exist = await ProductRepository.findByField("name", payload.name);

        if (exist) {
            throw new ApiError(400, "Product already exists with this name");
        }


        if (payload.barcode) {
            exist = await ProductRepository.findByField("barcode", payload.barcode);

            if (exist) {
                throw new ApiError(400, "Product already exists with this barcode");
            }
        }

        const product = await ProductRepository.updateProduct(id, payload);

        if (!product) {
            throw new ApiError(401, "Product Creation failed");
        }

        return product;
    }

    static async list(query: any) {
        const result = await ProductRepository.list(query);
        return result;
    }

    static async structuredProductByID(id: string) {
        const product = await ProductRepository.FullStructuredProductByID(id);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        return product;
    }

    static async productByBarcode(query: any) {
        const product = await ProductRepository.productByBarcode(query);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        return product;
    }

    static async batchByProduct(id: string) {
        const batch = await ProductRepository.batchByProductID(id);

        if (!batch) {
            throw new ApiError(404, "batch not found");
        }

        return batch;
    }

    static async serialByProduct(id: string) {
        const batch = await ProductRepository.batchByProductID(id);

        if (!batch) {
            throw new ApiError(404, "batch not found");
        }

        return batch;
    }

    static async findBatchBySerial(query: any) {

        const batch = await ProductRepository.findBatchBySerial(query);

        return batch;
    }

    static async getSaleProduct(
        productID: string
    ) {

        // 1. find product
        const product =
            await ProductRepository.findByID(
                productID
            );

        if (!product) {
            throw new ApiError(
                404,
                "Product not found"
            );
        }


        const formattedProduct =
            typeof product.toObject === "function"
                ? product.toObject()
                : product;
        // ================================
        // STOCK + NO WARRANTY
        // ================================
        if (
            formattedProduct.manageStock &&
            !formattedProduct.manageWarranty
        ) {
      
            const batches =
                await ProductRepository.findSaleBatches(
                    productID
                );

            const formattedBatches =
                batches.map((b) => ({
                    value: b._id,
                    label: `${Helper.formatDate(
                        b.PurchaseDate
                    )} - ${b.remainingQty}`,
                    ...b,
                }));

            return {
                ...formattedProduct,

                batches: formattedBatches,

                purchaseID:
                    formattedBatches[0]?.purchaseID,

                purchasePrice:
                    formattedBatches[0]?.purchasePrice,

                salePrice:
                    formattedBatches[0]?.salePrice,

                soldQty: 1,

                serials: [],

                selectedSerials: [],

                selectedBatch:
                    formattedBatches[0] || null,
            };
        }

        // ================================
        // STOCK + WARRANTY
        // ================================
        if (
            formattedProduct.manageStock &&
            formattedProduct.manageWarranty
        ) {

            const serials =
                await ProductRepository.findSaleSerials(
                    productID
                );

            const formattedSerials =
                serials.map((b) => ({
                    value: b._id,
                    label: b.serial,
                    ...b,
                }));

            return {
                ...formattedProduct,

                serials: formattedSerials,

                purchasePrice: 0,

                salePrice: 0,

                soldQty: 0,

                selectedSerials: [],

                batches: [],

                selectedBatch: null,

                purchaseID: null,
            };
        }

        // ================================
        // NO STOCK MANAGEMENT
        // ================================
        return formattedProduct;
    }

    static async findSaleReturnBatches(batchIDs: SaleProduct[], sale: SaleResponse) {
        return await ProductRepository.findSaleReturnBatches(batchIDs, sale);
    }

    static async createBatches(payloads: any[], session?: ClientSession) {
        const batches = await ProductRepository.createBatches(payloads, session);

        return batches;
    }

    static async findById(id: string, session?: ClientSession): Promise<ProductResponse | null> {
        return ProductRepository.findByID(id);
    }

    static async updateProductFifoBatchAndStock(productID: string,
        options: {
            fifoBatchID?: string;
            qty?: number;
            salePrice?:number;
            purchasePrice?:number;
        },
        session?: ClientSession) {

        return ProductRepository.updateProductFifoBatchAndStock(productID, options, session)
    }

    static async updateBatchDynamically(
        batchID: string,
        options: {
            set?: Partial<IBatch>;
            inc?: Partial<Record<keyof IBatch, number>>;
        },
        session?: ClientSession
    ) {
        return await ProductRepository.updateBatchDynamically(batchID, options, session);
    }

    static async findBatches(
        filter: Record<string, any>,
        session?: ClientSession
    ): Promise<BatchResponse[]> {

        return ProductRepository.findBatches(filter, session);
    }

    static async deleteBatches(
        filter: Record<string, any>,
        session?: ClientSession
    ) {

        await ProductRepository.deleteBatches(filter, session);
    }

    static async findBatchByID(
        id: string,
        session?: ClientSession
    ): Promise<BatchResponse | null> {

        return ProductRepository.findBatchByID(id, session);
    }
    static findOneBatch(
        filter: Record<string, any>,
        session?: ClientSession
    ) {
        return ProductRepository.findOneBatch(filter, session);
    }

    static async getSaleReturnBatches() {

    }
    static async getPosProducts() {
        return ProductRepository.findManyByField(
            "posEnabled",
            true
        );
    }
    static async updatePosProduct(id: string) {
        const product = await ProductRepository.findByID(id);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }
        if (!!product.manageWarranty) {
            throw new ApiError(404, "This product can not be added to pos");
        }

        return ProductRepository.updateProduct(
            id,
            {
                posEnabled: !product.posEnabled,
            }
        );
    }

    static async getFifoBatch(productID:string){
      const batches = await  ProductRepository.batchByProductID(
            productID
        );
        
        if(batches?.length === 0 || null){
            throw new ApiError(404, "No stock available");
        }
        
        return batches![0];
    }

    static async countProduct(filters: CountProductFilters){
        return await ProductRepository.countProduct(filters);
    }
}
