import { Request, Response } from "express";
import PaymentService from "./payment.service";

export class PaymentController {
  static async create(req: Request, res: Response) {
    const result = await PaymentService.create(req.body);

    return res.status(201).json({
      success: true,
      data: result,
      message: "Payment created successfully",
    });
  }

  static async list(req: Request, res: Response) {
    const result = await PaymentService.list(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  }

  static async findByID(req: Request, res: Response) {
    const paymentID = Number(req.params.id);
    const result = await PaymentService.findByID(paymentID);

    return res.status(200).json({
      success: true,
      data: result,
    });
  }
}
