import { Request, Response } from "express";
import { CreateDamageInput} from "./damage.type";
import DamageService from "./damage.service";

export class DamageController {

  static async create(req: Request, res: Response) {
    const damageInput: CreateDamageInput = req.body;

    const result = await DamageService.create(damageInput);


    res.status(201).json({
      success: true,
      data: result,
      msg: "Damage recorded successfully",
    });

  }

  static async list(req: Request, res: Response) {
    const result = await DamageService.list(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    await DamageService.delete(id.toString());

    res.status(200).json({
      success: true,
      msg: "Damage deleted and stock restored successfully",
    });

  }
}