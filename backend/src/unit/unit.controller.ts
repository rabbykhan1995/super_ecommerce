import { Request, Response } from "express";
import { UnitService } from "./unit.service";

export class CategoryController {
  static async create(req: Request, res: Response) {
    const brand = await UnitService.create(req.body);
    res.status(201).json({ success: true, data: brand, msg: "Created Successfully" });
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params

    const brand = await UnitService.update(id, req.body);

    res.status(201).json({ success: true, data: brand, msg: "Updated Successfully" });
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;

    await UnitService.delete(Number(id));

    res.status(201).json({ success: true, message: " deleted successfully" });
  }

  static async list(req: Request, res: Response) {
    // ম্যানুয়ালি সার্চ প্যারামিটার নিন
    const list = await UnitService.list(req.query);

    return res.status(200).json({
      success: true,
      data: list
    });
  }
}