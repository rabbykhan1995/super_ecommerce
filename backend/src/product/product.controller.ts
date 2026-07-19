import { Request, Response } from "express";
import {
  UpdateProductInput,
} from "./product.type";
import { ApiError } from "../../utils/ApiError";

import ProductService from "./product.service";
import ProductRepository from "./product.repository";
import { triggerRevalidation } from "../../utils/revalidate";

const HOME_SECTION_TAGS = [
  "home-flash-products",
  "home-featured-products",
  "home-offer-products",
];

export class ProductController {
  constructor() {
    // যদি future এ dependency inject করতে চাও, এখানে রাখা যাবে
  }
  // Create Product
  static async create(req: Request, res: Response) {
    const product = await ProductService.create(req.body);

    triggerRevalidation(HOME_SECTION_TAGS);

    res.status(201).json({
      success: true,
      data: product,
      msg: "Product Created Successfully",
    });
  }
  // update Product
  static async update(req: Request, res: Response) {
    const id = req.params.id;
    const { variants, ...productInput } = req.body;

    const product = await ProductService.update(Number(id), {
      productInput,
      variants: variants || [],
    });

    const updatedProduct = await ProductRepository.findByField("id", Number(id));
    const tags = [...HOME_SECTION_TAGS];
    if (updatedProduct?.slug) {
      tags.push(`product-${updatedProduct.slug}`);
    }
    triggerRevalidation(tags);

    res.status(201).json({
      success: true,
      data: product,
    });
  }
  // List Products
  static async list(req: Request, res: Response) {

    const result = await ProductService.list(req.query);
    //  I want to send response with the unitname, categoryname and brandname including..
    return res.status(200).json({ success: true, data: result });
  }

  static async variantList(req: Request, res: Response) {

    const result = await ProductService.variantList(req.query);
    //  I want to send response with the unitname, categoryname and brandname including..
    return res.status(200).json({ success: true, data: result });
  }
  
  static async getVariantsByProduct(req: Request, res: Response) {
    const { productID } = req.params;
    const variants = await ProductService.getVariantsByProductID(Number(productID));
    return res.status(200).json({ success: true, data: variants });
  }

  static async ecomProductList(req: Request, res: Response) {

    const q = req.query;

    const toNum = (v: unknown): number | undefined => {
      if (v == null || v === "") return undefined;
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    };

    const toNumArray = (v: unknown): number[] | undefined => {
      if (v == null || v === "") return undefined;
      const raw = Array.isArray(v) ? v : String(v).split(",");
      const nums = raw.map((item) => Number(String(item).trim())).filter((n) => !isNaN(n));
      return nums.length > 0 ? nums : undefined;
    };

    const toBool = (v: unknown): boolean | undefined => {
      if (v == null || v === "") return undefined;
      return String(v) === "true";
    };

    const parsed = {
      page: toNum(q.page) ?? 1,
      limit: toNum(q.limit) ?? 10,
      search: q.search ? String(q.search) : undefined,
      categoryID: toNumArray(q.categoryID),
      brandID: toNumArray(q.brandID),
      unitID: toNumArray(q.unitID),
      featured: toBool(q.featured),
      published: toBool(q.published),
      inStock: toBool(q.inStock),
      minPrice: toNum(q.minPrice),
      maxPrice: toNum(q.maxPrice),
      minRating: toNum(q.minRating),
      sort: q.sort ? String(q.sort) : undefined,
    };

    const result = await ProductService.ecomProductList(parsed);
    return res.status(200).json({ success: true, data: result });
  }
  static async productByID(req: Request, res: Response) {
    const { id } = req.params;

    const product = await ProductService.structuredProductByID(Number(id));

    res.status(200).json({ success: true, data: product });
  }

  static async productBySlug(req: Request, res: Response) {
    const { slug } = req.params;

    const product = await ProductService.findBySlug(slug);

    res.status(200).json({ success: true, data: product });
  }

  static async productByBarcode(req: Request, res: Response) {
    const { barcode } = req.query;

    if (!barcode) throw new ApiError(400, "Barcode is required");

    const product = await ProductService.productByBarcode(req.query);

    res.status(200).json({ success: true, data: product });
  }
  static async batchByVariant(req: Request, res: Response) {
    const variantID = req.params.id;

    const batches = await ProductService.batchByVariant(Number(variantID));


    res.status(200).json({ success: true, data: batches });
  }

  static async serialByProduct(req: Request, res: Response) {
    const productID = req.params.id;

    const serials = await ProductService.serialByProduct(productID as string);


    res.status(200).json({ success: true, data: serials });
  }
  // to validate the serial,
  static async findBatchBySerial(req: Request, res: Response) {
       const { serial } = req.query;
    const batch = await ProductService.findBatchBySerial(serial  as string);
    if (batch) {
      return res.status(200).json({
        success: false,
        exists: true,
        data: null
      });
    }
    return res.status(200).json({
      success: true,
      exists: false,
      data: null
    });


  }

  static async getSaleProduct(req: Request, res: Response) {
    const variantID = req.params.variantID
    const productID= req.params.productID;
    const product = await ProductService.getSaleProduct(Number(productID),Number(variantID)); // ✅ lean() দিয়ে plain object
    console.log(product)
    // ✅ No stock management - return plain product
    return res.status(200).json({
      success: true,
      data: product
    });

  }
  static async getPosProducts(req: Request, res: Response) {
    const list = await ProductService.getPosProducts();

    return res.status(200).json({
      success: true,
      data: list
    });
  }

  static async updatePosProduct(req: Request, res: Response) {
    await ProductService.updatePosProduct(Number(req.params.id));
    return res.status(201).json({
      success: true,
      msg: "Product added to pos list successfully"
    });
  }


}
