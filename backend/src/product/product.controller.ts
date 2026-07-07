import { Request, Response } from "express";
import {
  UpdateProductInput,
} from "./product.type";
import { ApiError } from "../../utils/ApiError";

import ProductService from "./product.service";

export class ProductController {
  constructor() {
    // যদি future এ dependency inject করতে চাও, এখানে রাখা যাবে
  }
  // Create Product
  static async create(req: Request, res: Response) {
    const product = await ProductService.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
      msg: "Product Created Successfully",
    });
  }
  // update Product
  static async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload: UpdateProductInput = req.body;

    const product = await ProductService.update(Number(id), payload);
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
  static async productByID(req: Request, res: Response) {
    const { id } = req.params;

    const product = await ProductService.structuredProductByID(Number(id));

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

    const batch = await ProductService.findBatchBySerial(req.query);
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
    const productID = req.params.id as string;

    const product = await ProductService.getSaleProduct(productID); // ✅ lean() দিয়ে plain object

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
    await ProductService.updatePosProduct(req.params.id.toString());
    return res.status(201).json({
      success: true,
      msg: "Product added to pos list successfully"
    });
  }

  static async getFifoBatch(req: Request, res: Response) {
    const batch = await ProductService.getFifoBatch(req.params.id.toString());
    return res.status(200).json({
      success: true,
      data: batch
    });
  }

}
