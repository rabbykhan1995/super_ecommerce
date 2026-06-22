import { Request, Response } from "express";
import { CreateFifoSaleInput, CreateSaleInput} from "./sale.type";
import { ApiError } from "../../utils/ApiError";
import SaleService from "./sale.service";

export class SaleController {
  static async create(req: Request, res: Response) {
    const payload: CreateSaleInput = req.body;
    let sale = await SaleService.create(payload);
      res.status(201).json({ success: true, data: sale, msg: "Sale created successfully" });
  }
  static async list(req: Request, res: Response) {
    const result = await SaleService.list(req.query);

    res.status(200).json({ success: true, data: result });
  }
  static async saleByID(req: Request, res: Response) {
    const { id } = req.params;

    const sale = await SaleService.saleInvoiceByID(id.toString());

    if (!sale) throw new ApiError(404, "Sale not found");

    return res.status(200).json({ success: true, data: sale });
  }
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    await SaleService.delete(id.toString());

    res.status(201).json({ success: true, msg: "Sale deleted successfully" });
  }

  static async fifoSale(req: Request, res: Response){
        const payload: CreateFifoSaleInput = req.body;
    let sale = await SaleService.fifoSale(payload);
      res.status(201).json({ success: true, data: sale, msg: "Sale created successfully" });
  }
}