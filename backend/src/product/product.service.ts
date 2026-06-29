
import { ApiError } from "../../utils/ApiError";
import Helper from "../../utils/helper";
import ProductRepository from "./product.repository";
import { BatchResponse, CreateProductInput, Batch, Product, UpdateProductInput, BatchPayload, VariantPayload, VariantAttribute } from "./product.type";
import { SaleProduct, SaleResponse } from "../sale/sale.type";
import { QueryClient } from "../../drizzle/src";



export default class ProductService {
    static async create(
        payload: CreateProductInput
    ) {

       const { variants, ...productData } = payload;

        let exist = await ProductRepository.findByField("name", payload.name);

        if (exist) {
            throw new ApiError(400, "Product already exists with this name");
        }


        let slug: string = Helper.generateSlug(payload.name);

        const existBySlug = await ProductRepository.findByField("slug", slug);

        if (existBySlug) {

            slug = `${slug}-${Helper.randomSuffix()}`;
            
        }


        const product = await ProductRepository.createProduct({...productData, slug});

        if (!product) {

            throw new ApiError(401, "Product Creation failed");

        }
        
        Promise.all(
            variants.map(async(v)=>{
                const variantPayload:VariantPayload = {...v, productID:product.id};

                const variantCreated = await ProductRepository.createVariant(variantPaylaod);
                // ekhon variant er create repo function create korte hobe, ar variant er barcode o dekhte hobe, etar jonno o ekta function create korte hobe repo te.
            }

            )
        )
        
        const variantPayload = {...varians}


        const batchPayload: BatchPayload = {
            productID: product.id,
            purchaseID: null,
            cost: product

        }
        const batch = await ProductRepository.createBatch({
            productID: product.id,
            // opening stock, no purchase yet
            purchaseID: null,
            purchasedQty: payload.stock,
            remainingQty: payload.stock,
            purchasePrice: payload.purchasePrice || 0,
            salePrice: payload.salePrice || 0,
            isActive: true,
        });

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

    static async structuredProductByID(id: number) {
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

    static async batchByProduct(id: number) {
    const batch = await ProductRepository.batchByProductID(id);

    if (!batch) {
        throw new ApiError(404, "batch not found");
    }

    return batch;
}

    static async serialByProduct(id: number) {
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
    productID: number
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

    static async createBatch(payload: any, tx ?: QueryClient) {
    const batches = await ProductRepository.createBatch(payload, tx);

    return batches;
}

    static async findById(productID: number, tx ?: QueryClient): Promise < Product | null > {
    return ProductRepository.findByID(productID, tx);
}

    static async updateProductFifoBatchAndStock(productID: number,
    options: {
    qty?: number;
    salePrice?: number;
    purchasePrice?: number;
},
    tx ?: QueryClient) {

    return ProductRepository.updateProductFifoBatchAndStock(productID, options, tx)
}

    static async updateBatchDynamically(
    batchID: number,
    options: {
    set?: Partial<Batch>;
    inc?: Partial<Record<keyof Batch, number>>;
},
    tx ?: QueryClient
) {
    return await ProductRepository.updateBatchDynamically(batchID, options, tx);
}

    static async findBatches(
    filter: Record<string, any>,
    tx ?: QueryClient
): Promise < BatchResponse[] > {

    return ProductRepository.findBatches(filter, tx);
}

    static async deleteBatches(
    filter: Record<string, any>,
    tx ?: QueryClient
) {

    await ProductRepository.deleteBatches(filter, tx);
}

    static async findBatchByID(
    id: string,
    tx ?: QueryClient
): Promise < BatchResponse | null > {

    return ProductRepository.findBatchByID(id, tx);
}
    static findOneBatch(
    filter: Record<string, any>,
    tx ?: QueryClient
) {
    return ProductRepository.findOneBatch(filter, tx);
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

    static async getFifoBatch(productID: number){
    const batches = await ProductRepository.batchByProductID(
        productID
    );

    if (batches?.length === 0 || null) {
        throw new ApiError(404, "No stock available");
    }

    return batches![0];
}

    static async countProduct(filters: CountProductFilters){
    return await ProductRepository.countProduct(filters);
}
}
