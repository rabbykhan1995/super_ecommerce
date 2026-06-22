import { Request, Response } from "express";
import PurchaseService from "./purchase.service";

export class PurchaseController {
  static async create(req: Request, res: Response) {
    const purchase = await PurchaseService.create(req.body);

    res.status(201).json({ success: true, data: purchase, msg: "Purchase created successfully" });
  }

  static async list(req: Request, res: Response) {
    const result = await PurchaseService.list(req.query);

    res.status(200).json({ success: true, data: result });
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    await PurchaseService.delete(id.toString());

    res.status(200).json({ success: true, msg: "Purchase deleted successfully" });


  }

  static async purchaseInvoiceByID(
    req: Request,
    res: Response
  ) {
    const { id } = req.params;
    const result =
      await PurchaseService.purchaseInvoiceByID(
        id.toString()
      );

    return res.status(200).json({
      success: true,
      data: result,
    });
  }
}