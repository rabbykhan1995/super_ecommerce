import { ClientSession, Types } from "mongoose";
import { Expense, ExpenseType } from "./expense.model";

import {
  aggregateOne,
  paginatedAggregate,
} from "../../utils/queryBuilder";
import { SaleProduct, SaleResponse } from "../sale/sale.type";
import {
  CreateExpenseInput,
  ExpenseResponse,
  ExpenseTypeResponse,
} from "./expense.type";
import { PaginatedResponse } from "../../types/training.type";

export default class ExpenseRepository {
  private static buildListFilter(query: Record<string, any>) {
    const filter: Record<string, any> = {};
    if (query.expenseTypeID) {
      filter.expenseTypeID = new Types.ObjectId(query.expenseTypeID as string);
    }
    if (query.fromDate || query.toDate) {
      filter.expenseDate = {};
      if (query.fromDate) {
        filter.expenseDate.$gte = new Date(query.fromDate as string);
      }
      if (query.toDate) {
        filter.expenseDate.$lte = new Date(query.toDate as string);
      }
    }
    return filter;
  }

  static async createExpenseType(payload: { name: string }) {
    return await ExpenseType.create(payload);
  }
  static async findExpenseType(
    name: string,
  ): Promise<ExpenseTypeResponse | null> {
    return await ExpenseType.findOne({ name });
  }

  static async findExpenseTypeById(id: string, session?: ClientSession): Promise<ExpenseResponse | null> {
    return await ExpenseType.findById(new Types.ObjectId(id), null, { session });
  }
  static async allExpenseType(): Promise<ExpenseTypeResponse[] | []> {
    return await ExpenseType.find();
  }

  static async updateExpenseType(id: string, name: string) {
    return await ExpenseType.findByIdAndUpdate(id, { $set: { name } });
  }

  static async expenseTypeExistOnAnyExpense(expenseID: string) {
    return await Expense.exists({ expenseTypeID: expenseID });
  }

  static async deleteExpenseType(id: string) {
    return await ExpenseType.findByIdAndDelete(id);
  }

  static async createExpense(
    payload: any,
    session?: ClientSession
  ): Promise<ExpenseResponse> {
    const [expense] = await Expense.create([payload], { session });
    return expense;
  }

  static async deleteExpense(id: string, session?: ClientSession) {
    return Expense.findByIdAndDelete(id, { session });
  }

  static async list(
    query: Record<string, any>,
  ): Promise<PaginatedResponse<any>> {
    return await paginatedAggregate({
      model: Expense,
      query,
      filter: ExpenseRepository.buildListFilter(query),
      postLookupSearch: true,
      defaultSort: { expenseDate: -1 },
      searchFields: [{ field: "note" }, { field: "expenseType.name" }],
      lookups: [
        {
          from: "expensetypes", // Mongoose collection for ExpenseType model
          localField: "expenseTypeID",
          foreignField: "_id",
          as: "expenseType",
          preserveNull: true,
        },
      ],
      projection: {
        include: [
          "expenseTypeID",
          "paid",
          "note",
          "documentImage",
          "expenseDate",
          "createdAt",
        ],
        computed: {
          expenseTypeName: "$expenseType.name",
        },
      },
    });
  }

  static async findExpenseById(id: string): Promise<ExpenseResponse | null> {
    return await Expense.findById(new Types.ObjectId(id));
  }
}
