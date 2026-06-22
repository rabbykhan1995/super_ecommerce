import { Request, Response } from "express";
import {} from "./expense.type";
import { ApiError } from "../../utils/ApiError";

import ExpenseService from "./expense.service";

export class ExpenseController {
  constructor() {
    // যদি future এ dependency inject করতে চাও, এখানে রাখা যাবে
  }

  static async allExpenseTypes(req: Request, res: Response) {
    const result = await ExpenseService.allExpenseType();
    //  I want to send response with the unitname, categoryname and brandname including..
    return res.status(200).json({ success: true, data: result });
  }

  static async createExpenseType(req: Request, res: Response) {
    const expenseType = await ExpenseService.createExpenseType(req.body);

    res.status(201).json({
      success: true,
      data: expenseType,
      msg: "Expense type Created Successfully",
    });
  }

  static async updateExpenseType(req: Request, res: Response) {
    const expenseType = await ExpenseService.updateExpenseType(
      req.params.id.toString(),
      req.body.name,
    );

    res.status(201).json({
      success: true,
      data: expenseType,
      msg: "Expense type Updated Successfully",
    });
  }

  static async deleteExpenseType(req: Request, res: Response) {
    await ExpenseService.deleteExpenseType(req.params.id.toString());

    return res.status(201).json({
      success: true,
      msg: "Expense type Deleted Successfully",
    });
  }

  static async createExpense(req: Request, res: Response) {
    const expense = await ExpenseService.createExpense(req.body);

    return res.status(201).json({
      success: true,
      msg: "Expense Created Successfully",
      data: expense,
    });
  }
  static async deleteExpense(req: Request, res: Response) {
    await ExpenseService.deleteExpense(req.params.id.toString());
    return res.status(200).json({
      success: true,
      msg: "Expense deleted successfully",
    });
  }
  static async list(req: Request, res: Response) {
    const result = await ExpenseService.list(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
}
