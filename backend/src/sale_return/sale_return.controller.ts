import { Request, Response } from "express";
import SaleReturnService from "./sale_return.service";

export class SaleReturnController {
  static async create(req: Request, res: Response) {
    await SaleReturnService.create(req.body);
    return res
      .status(201)
      .json({ success: true, msg: "Sale return successful" });
  }

  static async list(req: Request, res: Response) {
    const result = await SaleReturnService.list(req.query);
    res.status(200).json({ success: true, data: result });
  }

  static async saleReturnByID(req: Request, res: Response) {
    const { id } = req.params;
    const invoice = await SaleReturnService.saleReturnInvoiceByID(
      Number(id),
    );
    res.status(200).json({ success: true, data: invoice });
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    await SaleReturnService.delete(Number(id));
    return res
      .status(200)
      .json({ success: true, msg: "Sale return deleted" });
  }
}
