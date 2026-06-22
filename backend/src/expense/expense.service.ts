import mongoose, { ClientSession } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import Helper from "../../utils/helper";
import ExpenseRepository from "./expense.repository";
import { SaleProduct, SaleResponse } from "../sale/sale.type";
import { CreateExpenseInput } from "./expense.type";
import { AccountService } from "../account/account.service";
import TransactionService from "../transaction/transaction.service";
import PayloadBuilder from "../../utils/builder";
import { RedisReportService } from "../../utils/ReportServiceRedis";

export default class ExpenseService {
  static async createExpenseType(payload: { name: string }) {
    const isExist = await ExpenseRepository.findExpenseType(payload.name);

    if (isExist) {
      throw new ApiError(401, "Expense is already exist");
    }

    const expenseType = await ExpenseRepository.createExpenseType(payload);

    if (!expenseType) {
      throw new ApiError(401, "Expense creation failed, try again");
    }

    return expenseType;
  }

  static async allExpenseType() {
    return await ExpenseRepository.allExpenseType();
  }

  static async updateExpenseType(id: string, name: string) {
    const isExist = await ExpenseRepository.findExpenseType(name);
    if (isExist) {
      throw new ApiError(401, "Expense is already exist");
    }

    return await ExpenseRepository.updateExpenseType(id, name);
  }

  static async deleteExpenseType(id: string) {
    const isExist = await ExpenseRepository.expenseTypeExistOnAnyExpense(id);

    if (isExist) {
      throw new ApiError(401, "Can not be deleted");
    }

    return await ExpenseRepository.deleteExpenseType(id);
  }

  static async createExpense(payload: CreateExpenseInput) {
    const { accounts, paid, expenseTypeID, note, expenseDate } = payload;
    // 1. Validate expense type — via repository, not model
    const expenseType = await ExpenseRepository.findExpenseTypeById(expenseTypeID);
    if (!expenseType) {
      throw new ApiError(404, "Expense type not found");
    }
    // 2. Validate payment vs accounts
    const totalPaidFromAccounts = accounts.reduce((sum, a) => sum + a.amount, 0);
    if (paid > 0) {
      if (!accounts.length) {
        throw new ApiError(400, "Accounts are required when paid amount is greater than 0");
      }
      if (totalPaidFromAccounts !== paid) {
        throw new ApiError(400, "Sum of account amounts must equal paid amount");
      }
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 3. Create expense — repository handles DB payload
      const expense = await ExpenseRepository.createExpense(payload, session);
      // 4. Payment — money goes OUT (same as purchase)
      if (paid > 0 && accounts.length > 0) {
        await AccountService.decreaseBalance(accounts, session);
        const transactionPayload = PayloadBuilder.transaction(accounts, {
          type: "expense",
          typeID: expense._id.toString(),
          typeModel: "Expense",
          accountField: "fromAccount",
          date: expenseDate,
          note: note ?? "",
          status: "completed",
        });
        await TransactionService.create(transactionPayload, session);
      }
      await session.commitTransaction();

      await RedisReportService.updateExpenseReport(
        { paid: expense.paid, date: expense.expenseDate }
      );

      return expense;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async list(query: Record<string, any>) {
    return await ExpenseRepository.list(query);
  }

  static async deleteExpense(id: string) {
    const expense = await ExpenseRepository.findExpenseById(id);
    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Reverse payment — create used decreaseBalance, so delete uses increaseBalance
      if (expense.paid > 0 && expense.accounts.length > 0) {
        await AccountService.increaseBalance(
          expense.accounts.map((a) => ({
            accountID: a.accountID.toString(),
            amount: a.amount,
          })),
          session,
        );
        await TransactionService.deleteTransactions(
          { typeID: expense._id, typeModel: "Expense" },
          session,
        );
      }
      await ExpenseRepository.deleteExpense(expense._id.toString(), session);
      await session.commitTransaction();

      await RedisReportService.updateExpenseReport(
        { paid: -expense.paid, date: expense.expenseDate }
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
