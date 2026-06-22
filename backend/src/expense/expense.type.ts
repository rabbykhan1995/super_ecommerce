import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createExpenseSchema } from "./expense.validator";

export interface IExpense extends Document {
  expenseTypeID: Types.ObjectId;
  note?: string;
  documentImage?: string;
  accounts: { accountID: Types.ObjectId; amount: number }[] | [];
  paid: number;
  expenseDate: Date;
}

export type ExpenseResponse = HydratedDocument<IExpense>;

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export interface IExpenseType extends Document {
  name: string;
}

export type ExpenseTypeResponse = HydratedDocument<IExpenseType>;

export type ExpenseListItem = {
  _id: Types.ObjectId;
  expenseTypeID: Types.ObjectId;
  expenseTypeName: string | null;
  paid: number;
  note?: string | null;
  documentImage?: string | null;
  expenseDate: Date;
  createdAt: Date;
};
