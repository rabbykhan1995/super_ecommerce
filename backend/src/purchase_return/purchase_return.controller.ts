import { Request, Response } from "express";
import PurchaseReturnService from "./purchase_return.service";

export class PurchaseReturnController {

  static async create(req: Request, res: Response) {
    await PurchaseReturnService.create(req.body);
    return res.status(201).json({ success: true, msg: "Purchase return successful" });
  }

  static async list(req: Request, res: Response) {
    const result = await PurchaseReturnService.list(req.query);

    res.status(200).json({ success: true, data: result });
  }

  static async purchaseReturnByID(req: Request, res: Response) {
    const { id } = req.params;
    const invoice = await PurchaseReturnService.purchaseReturnInvoiceByID(Number(id))

    res.status(200).json({ success: true, data: invoice });
  }

static async purchaseForReturnByID(req: Request, res: Response) {
    const { id } = req.params;
    const invoice = await PurchaseReturnService.purchaseForReturnByID(Number(id))

    res.status(200).json({ success: true, data: invoice });
  }
  

  // static async getPurchaseReturnBatches(req: Request, res: Response) {
  //   const { purchaseID } = req.params;
  //   // এই purchaseID দিয়ে batch আছে কিনা

  //   const batches = await PurchaseReturnService.getPurchaseReturnBatches(purchaseID);

  //   return res.status(200).json({ success: true, data: batches });
  // }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
      await PurchaseReturnService.delete(Number(id));
      return res.status(200).json({ success: true, msg: "Purchase return deleted" });
  }
}