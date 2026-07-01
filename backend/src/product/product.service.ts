import { ApiError } from "../../utils/ApiError";
import Helper from "../../utils/helper";
import ProductRepository from "./product.repository";
import { CreateProductInput, Batch, Product, UpdateProductInput, VariantPayload, stockFlowPayload } from "./product.type";
import { QueryClient } from "../../drizzle/src";
import { withTransaction } from "../../utils/withTransaction";



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


        await withTransaction(async (tx) => {
            const product = await ProductRepository.createProduct({ ...productData, slug }, tx);

            if (!product) {

                throw new ApiError(401, "Product Creation failed");

            }

            await Promise.all(
                variants.map(async (v) => {

                    if (v.barcode) {
                        const exist = await ProductRepository.findVariantByBarcode(v.barcode);

                        if (exist) {

                            throw new ApiError(400, "Please try with some different barcode");

                        }
                    }

                    const variantPayload: VariantPayload = { ...v, productID: product.id };

                    const variantCreated = await ProductRepository.createVariant(variantPayload, tx);

                    if (!variantCreated) {
                        throw new ApiError(400, "variant creation failed");
                    }


                }

                )
            )
        })



    }


    static async update(
        id: number, payload: { productInput: UpdateProductInput, variants: VariantPayload[] }
    ) {
        const { productInput, variants } = payload;
        const hasProductFields = productInput && Object.keys(productInput).length > 0;

       await withTransaction(async (tx) => {
            if (hasProductFields) {

                let exist;

                if (productInput.name) {
                    exist = await ProductRepository.findByFieldExceptId("name", productInput.name, id);

                    if (exist) {
                        throw new ApiError(400, "Product already exists with this name");
                    }

                }


                const product = await ProductRepository.updateProduct(id, productInput, tx);

                if (!product) {
                    throw new ApiError(401, "Product Creation failed");
                }
            }




            if (variants.length > 0) {

                const haveToCreateNewVariant: boolean = variants.some(v => !v.id);

                const oldVariantsToUpdate = variants.filter(v => !!v.id);


                if (haveToCreateNewVariant) {
                    const newVariants: VariantPayload[] = variants.filter(v => !v.id);

                    await Promise.all(
                        newVariants.map(async (v) => {

                            if (v.barcode) {
                                const exist = await ProductRepository.findVariantByBarcode(v.barcode);

                                if (exist) {

                                    throw new ApiError(400, "Please try with some different barcode");

                                }
                            }

                            const variantPayload: VariantPayload = { ...v, productID: id };

                            const variantCreated = await ProductRepository.createVariant(variantPayload, tx);

                            if (!variantCreated) {
                                throw new ApiError(400, "variant creation failed");
                            }


                        }

                        )
                    )

                }

                if (oldVariantsToUpdate.length > 0) {
                    await Promise.all(
                        oldVariantsToUpdate.map(async (v) => {

                            if (v.barcode) {
                                const exist = await ProductRepository.findVariantByBarcodeExceptID(v.barcode, v.id as number);

                                if (exist) {

                                    throw new ApiError(400, "Please try with some different barcode");

                                }
                            }

                            const { id, ...variantPayload } = v;

                            const variantUpdate = await ProductRepository.updateVariant(id!, variantPayload, tx);

                        }

                        )
                    )
                }

            }
        })


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
    
    static async findVariantByID(variantID:number, tx?:QueryClient){
        return await ProductRepository.findVariantByID(variantID, tx);
    }

    static async findById(productID: number, tx?: QueryClient): Promise<Product | null> {
        return ProductRepository.findByID(productID, tx);
    }

    static async updateProductFifoBatchAndStock(productID: number,
        options: {
            qty?: number;
            salePrice?: number;
            purchasePrice?: number;
        },
        tx?: QueryClient) {

        return ProductRepository.updateProductFifoBatchAndStock(productID, options, tx)
    }

    static async updateBatchDynamically(
        batchID: number,
        options: {
            set?: Partial<Batch>;
            inc?: Partial<Record<keyof Batch, number>>;
        },
        tx?: QueryClient
    ) {
        return await ProductRepository.updateBatchDynamically(batchID, options, tx);
    }


    static async deleteBatches(
        filter: Record<string, any>,
        tx?: QueryClient
    ) {

        await ProductRepository.deleteBatches(filter, tx);
    }

    static async findBatchByID(
        id: number,
        tx?: QueryClient
    ): Promise<Batch | null> {

        return ProductRepository.findBatchByID(id, tx);
    }
    static findOneBatch(
        filter: Record<string, any>,
        tx?: QueryClient
    ) {
        return ProductRepository.findOneBatch(filter, tx);
    }

    static async getSaleReturnBatches() {

    }
    static async getPosProducts() {
        return ProductRepository.findManyByField(
            "inPosList",
            true
        );
    }
    static async updatePosProduct(id: number) {
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

    static async getFifoBatch(productID: number) {
        const batches = await ProductRepository.batchByProductID(
            productID
        );

        if (batches?.length === 0 || null) {
            throw new ApiError(404, "No stock available");
        }

        return batches![0];
    }

    static async countProduct(filters: CountProductFilters) {
        return await ProductRepository.countProduct(filters);
    }
    static async decreaseProductStock(productID: number, qty:number, tx?:QueryClient) {
        return await ProductRepository.decreaseProductStock(productID, qty, tx);
    }

       static async increaseProductStock(productID: number, qty:number, tx?:QueryClient) {
        return await ProductRepository.increaseProductStock(productID, qty, tx);
    }

        static async createStockFlow(payload: stockFlowPayload, tx?:QueryClient) {
        return await ProductRepository.createStockFlow(payload, tx);
    }

        static async decreaseVariantStock(variantID: number, qty:number, tx?:QueryClient) {
        return await ProductRepository.decreaseVariantStock(variantID, qty, tx);
    }

       static async increaseVariantStock(variantID: number, qty:number, tx?:QueryClient) {
        return await ProductRepository.increaseVariantStock(variantID, qty, tx);
    }

}
