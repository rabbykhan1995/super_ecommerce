import mongoose, { Types } from "mongoose";


import { IExpenseType, IExpense } from "./expense.type";
// this is final, no thing to update
const expenseSchema = new mongoose.Schema<IExpense>(
  {
    paid: {
      type: Number,
      default: 0
    },
    expenseTypeID: {
      type: Types.ObjectId,
      ref: "ExpenseType",
      required: true,
    },
    note: { type: String, default: null },
    documentImage: { type: String, default: null },
    expenseDate: {
      type: Date,
      default: Date.now
    },
    accounts: [
      {
        _id: false,
        accountID: { type: Types.ObjectId, ref: "Account" },
        amount: { type: Number },
      }
    ],
  }, { timestamps: true }
);

export const Expense = mongoose.model<IExpense>("Expense", expenseSchema);

const expenseTypeSchema = new mongoose.Schema<IExpenseType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
);

export const ExpenseType = mongoose.model<IExpenseType>("ExpenseType", expenseTypeSchema);


