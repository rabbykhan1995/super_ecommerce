import { ApiError } from "../../utils/ApiError";
import ExpenseRepository from "./expense.repository";
import { CreateExpenseInput, Expense, ExpensePayload } from "./expense.type";
import { AccountService } from "../account/account.service";
import TransactionService from "../transaction/transaction.service";
import { RedisReportService } from "../../utils/ReportServiceRedis";
import { withTransaction } from "../../utils/withTransaction";
import { TransactionPayload } from "../transaction/transaction.type";

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

  static async updateExpenseType(id: number, name: string) {
    const isExist = await ExpenseRepository.findExpenseType(name);
    if (isExist) {
      throw new ApiError(401, "Expense is already exist");
    }

    return await ExpenseRepository.updateExpenseType(id, name);
  }

  static async deleteExpenseType(id: number) {
    const isExist = await ExpenseRepository.expenseTypeExistOnAnyExpense(id);

    if (isExist) {
      throw new ApiError(401, "Can not be deleted");
    }

    return await ExpenseRepository.deleteExpenseType(id);
  }

  static async createExpense(payload: CreateExpenseInput) {
    const { accounts, paid, expenseTypeID, note, expenseDate, exchangeAccounts, exchangeAmount, documentImage } = payload;
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
    const expense = await withTransaction(async (tx) => {

      const expensePayload: ExpensePayload = {
        expenseTypeID,
        documentImage,
        exchangeAmount,
        expenseDate,
        note,
        paid,
      }

      const expense = await ExpenseRepository.createExpense(expensePayload, tx);
      // 4. Payment — money goes OUT (same as purchase)
      if (paid > 0) {
        await AccountService.decreaseBalance(accounts, tx);

        await Promise.all(
          accounts.map(async (account) => {
            const transactionPayload: TransactionPayload = {
              accountID: account.accountID,
              amount: account.amount,
              date: expenseDate,
              source: "expense",
              type: "debit",
              expenseID: expense?.id,
            }
            await TransactionService.create(transactionPayload, tx);
          })
        );
      }
      if (exchangeAmount > 0) {
        await AccountService.increaseBalance(exchangeAccounts, tx);

        await Promise.all(
          accounts.map(async (account) => {
            const transactionPayload: TransactionPayload = {
              accountID: account.accountID,
              amount: account.amount,
              date: expenseDate,
              source: "expense",
              type: "credit",
              expenseID: expense?.id,
            }
            await TransactionService.create(transactionPayload, tx);
          })
        );
      }
      return expense;
    })


    await RedisReportService.updateExpenseReport(
      { paid: expense!.paid, date: expense!.expenseDate }
    );



  }

  static async list(query: Record<string, any>) {
    return await ExpenseRepository.list(query);
  }

  static async deleteExpense(id: number) {
    const expense = await ExpenseRepository.findExpenseById(id);
    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }

    await withTransaction(async (tx) => {
      // Reverse payment — create used decreaseBalance, so delete uses increaseBalance
      const allTransactions = await TransactionService.findBySourceID(expense.id, "expense");
      // account balance reverse
      const isPaymentHappened: boolean = expense.paid > 0
      if (isPaymentHappened) {

        const accTrans = allTransactions.filter(a => a.type === "debit");

        const accounts = accTrans.map(a => ({ accountID: a.accountID, amount: a.amount as number }));

        await AccountService.decreaseBalance(
          accounts, tx
        );
      }
      const isExchangeHappened: boolean = expense.exchangeAmount > 0;
      if (isExchangeHappened) {

        const accTrans = allTransactions.filter(a => a.type === "credit");

        const exchangeAccounts = accTrans.map(a => ({ accountID: a.accountID, amount: a.amount as number }));
        await AccountService.increaseBalance(exchangeAccounts, tx);
      }
      await ExpenseRepository.deleteExpense(expense.id, tx);

      await RedisReportService.updateExpenseReport(
        { paid: -expense.paid, date: expense.expenseDate }
      );
    })

  }
}
