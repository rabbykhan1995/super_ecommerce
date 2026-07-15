import { Request, Response } from "express";
import {
  CreateParcelInput,
  UpdateParcelStatusInput,
  UpdateParcelInput,
} from "./parcel.type";
import ParcelService from "./parcel.service";

export class ParcelController {
  static async create(req: Request, res: Response) {
    const payload: CreateParcelInput = req.body;
    const parcel = await ParcelService.create(payload);

    res.status(201).json({
      success: true,
      data: parcel,
      msg: "Parcel created successfully",
    });
  }

  static async list(req: Request, res: Response) {
    const result = await ParcelService.list(req.query);

    res.status(200).json({ success: true, data: result });
  }

  static async getByID(req: Request, res: Response) {
    const { id } = req.params;
    const parcel = await ParcelService.getByID(Number(id));

    res.status(200).json({ success: true, data: parcel });
  }

  static async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const payload: UpdateParcelStatusInput = req.body;
    const updated = await ParcelService.updateStatus(Number(id), payload);

    res.status(200).json({
      success: true,
      data: updated,
      msg: "Parcel status updated successfully",
    });
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const payload: UpdateParcelInput = req.body;
    const updated = await ParcelService.update(Number(id), payload);

    res.status(200).json({
      success: true,
      data: updated,
      msg: "Parcel updated successfully",
    });
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    await ParcelService.delete(Number(id));

    res.status(200).json({
      success: true,
      msg: "Parcel deleted successfully",
    });
  }

  static async getCustomerAddress(req: Request, res: Response) {
    const { customerID } = req.params;
    const result = await ParcelService.getCustomerAddress(Number(customerID));

    res.status(200).json({ success: true, data: result });
  }
}
