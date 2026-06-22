import { Request, Response } from "express";
import SaleReturnService from "./sale_return.service";

export class SaleReturnController {

  static async create(req: Request, res: Response) {
    const saleReturn = await SaleReturnService.create(req.body);
    res.status(201).json({ msg: "Sale Return Successfull", success: true, data: saleReturn });

  }

  static async list(req: Request, res: Response) {
    const result = await SaleReturnService.list(req.query);

    res.status(200).json({ success: true, data: result });
  }

  static async saleReturnByID(req: Request, res: Response) {
    const { id } = req.params;
    const saleReturn = await SaleReturnService.saleReturnInvoiceByID(id.toString());
    return res.status(200).json({ success: true, data: saleReturn });
  }

  static async getSaleReturnBatches(req: Request, res: Response) {
    const { saleID } = req.params;

    const batches = await SaleReturnService.getSaleReturnBatches(saleID.toString());

    return res.status(200).json({ success: true, data: batches });
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
     
    await SaleReturnService.delete(id.toString());

    res.status(201).json({msg:"deleted successfully",success:true});
    
  }
}