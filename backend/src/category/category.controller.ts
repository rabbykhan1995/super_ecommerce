import { Request, Response } from "express";
import { CategoryService } from "./category.service";

export class CategoryController {
  static async create(req: Request, res: Response) {
    const brand = await CategoryService.create(req.body);
    res.status(201).json({ success: true, data: brand, msg: "Created Successfully" });
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params

    const brand = await CategoryService.update(id, req.body);

    res.status(201).json({ success: true, data: brand, msg: "Updated Successfully" });
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;

    await CategoryService.delete(Number(id));

    res.status(201).json({ success: true, message: "Category deleted successfully" });
  }

  static async list(req: Request, res: Response) {
    // ম্যানুয়ালি সার্চ প্যারামিটার নিন
    const list = await CategoryService.list();

    return res.status(200).json({
      success: true,
      data: list
    });
  }
}