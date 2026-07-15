import { Request, Response } from "express";
import WarrantyService from "./warranty.service";

export default class WarrantyController {
  static async list(req: Request, res: Response) {
    const result = await WarrantyService.list(req.query);

    res.status(200).json({ success: true, data: result });
  }
  static async claim(req: Request, res: Response) {
    const result = await WarrantyService.claimWarranty(Number(req.params.id), req.body);

    res.status(201).json({ msg: "Warranty has been changed successfully", success: true, data: result });

  }
  static async sendToSupplier(req: Request, res: Response) {
    const result = await WarrantyService.sendToSupplier(Number(req.params.id), req.body);

    res.status(201).json({ msg: "Warranty has been changed successfully", success: true, data: result });

  }
  static async supplierActionUpdate(req: Request, res: Response) {
    const result = await WarrantyService.supplierActionUpdate(Number(req.params.id), req.body);

    res.status(201).json({ msg: "Suppleir action updated", success: true, data: result });

  }

  static async recieveFromSupplier(req: Request, res: Response) {
    const result = await WarrantyService.recieveFromSupplier(Number(req.params.id), req.body);

    res.status(201).json({ msg: "Recieved from supplier successfull", success: true, data: result });

  }
  static async returnToCustomer(req: Request, res: Response) {
    const result = await WarrantyService.returnToCustomer(Number(req.params.id), req.body);

    res.status(201).json({ msg: "Send to Customer successfull", success: true, data: result });

  }
}
