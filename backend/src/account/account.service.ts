import mongoose, { ClientSession, Types } from "mongoose";
import AccountRepository from "./account.repository";
import { AccBalancePayload, Account, CreateAccountInput, UpdateAccountInput } from "./account.type";
import { ApiError } from "../../utils/ApiError";
import Transaction from "../transaction/transaction.model";
import { DbTransactionClient, runInTransaction as withTransaction } from "../../utils/runTransaction";
import db, { QueryClient } from "../../drizzle/src";
import PayloadBuilder from "../../utils/builder";

export class AccountService {

    static async increaseBalance(
        accounts: AccBalancePayload[],
        tx?:QueryClient
    ) {
        await AccountRepository.increaseAccountsAmount(
            accounts,
            tx
        );
    }

    static async decreaseBalance(
        accounts: AccBalancePayload[],
           tx?:QueryClient
    ) {
        await AccountRepository.decreaseAccountsAmount(
            accounts,
            tx
        );
    }

    static async create(
        payload: CreateAccountInput
    ): Promise<Account> {

        // check duplicate account 

        const exist =
            await AccountRepository.findByName(
                payload.name
            );

        if (exist) {
            throw new ApiError(
                400,
                "Account already exists with this name"
            );
        }

        // check default account

        if (payload.default === true) {

            const defaultAccount =
                await AccountRepository.findDefault();

            if (defaultAccount) {
                throw new ApiError(
                    400,
                    "Default account already exists"
                );
            }
        }

        // create account

        const account: Account | null =
            await AccountRepository.create(payload);

        if (!account) {
            throw new ApiError(
                500,
                "Account creation failed"
            );
        }

        return account;
    }

    static async update(accountID: number,
        payload: UpdateAccountInput
    ): Promise<Account> {
        // check duplicate account

        const account: Account =
            await AccountRepository.findByID(
                accountID
            );

        if (!account) {
            throw new ApiError(
                404,
                "Your Account didn't found"
            );
        }

        if (payload.name) {
            const exist = await AccountRepository.findByName(payload.name, accountID);
            if (exist) throw new ApiError(400, "Account already exists with this name");
        }

        if (payload.default === true) {
            const exist = await AccountRepository.findDefault(accountID);// ✅ id দিয়ে বাদ দাও
            if (exist) throw new ApiError(400, "Default account already exists");
        }

        const updatedAccount: Account| null = await AccountRepository.updateById(accountID, payload) // ✅ create না, update
        if (!updatedAccount) throw new ApiError(404, "Account not found");

        // create account



        return updatedAccount;
    }

    static async list(): Promise<Account[] | []> {
        // check duplicate account
        const accounts: Account[] | [] =
            await AccountRepository.getAllAccounts();
        return accounts;
    }

    static async accountByID(accountID: number, nullString?: string): Promise<Account> {
        // check duplicate account

    
        const account: Account | null =
            await AccountRepository.findByID(accountID);

        if (!account) {
            throw new ApiError(404, `${nullString} Account not found`)
        }
        return account;
    }

    static async balanceTransfer2(payload: any) {

        const {
            selectedFrom,
            selectedTo,
            amount
        } = payload;

        // 1. fetch accounts
        const fromAcc: Account =
            await this.accountByID(
                selectedFrom.id, "SelectedFrom"
            );

        const toAcc: Account=
            await this.accountByID(
                selectedTo.id, "SelectedTo"
            );


        // 2. business rule
        if (fromAcc.balance < amount) {
            throw new ApiError(
                400,
                `${fromAcc.name} balance must be greater than ${amount}`
            );
        }

        // 3. transaction start
        const session =
            await mongoose.startSession();

        session.startTransaction();

        try {

            // 4. update accounts
            await AccountRepository.decreaseAccountsAmount(
                [{
                    accountID: fromAcc.id,
                    amount
                }],
                
            );

            await AccountRepository.increaseAccountsAmount(
                [{
                    accountID: fromAcc._id.toString(),
                    amount
                }],
                session
            );
 
            await Transaction.create(
                [
                    {
                        type: "transfer",
                        fromAccount: fromAcc._id,
                        toAccount: toAcc._id,
                        amount,
                        status: "completed",
                        date: new Date(),
                    },
                ],
                { session }
            );

            await session.commitTransaction();

            return {
                fromAccount: fromAcc._id,
                toAccount: toAcc._id,
                amount
            };

        } catch (error) {

            await session.abortTransaction();
            throw error;

        } finally {
            session.endSession();
        }
    }

    static async balanceTransfer(payload: any) {
  const { selectedFrom, selectedTo, amount } = payload;

  const fromAcc = await this.accountByID(selectedFrom.id, "SelectedFrom");
  const toAcc = await this.accountByID(selectedTo.id, "SelectedTo");

  if (fromAcc.balance < amount) {
    throw new ApiError(
      400,
      `${fromAcc.name} balance must be greater than ${amount}`
    );
  }

  return await withTransaction(async (tx) => {

    await AccountRepository.decreaseAccountsAmount(
      [{
        accountID: fromAcc.id,
        amount
      }],
      tx
    );

    await AccountRepository.increaseAccountsAmount(
      [{
        accountID: toAcc.id,   // ✅ FIXED (আগে ভুল ছিল)
        amount
      }],
      tx
    );

    await tx.insert(Transaction).values({
      type: "transfer",
      fromAccount: fromAcc.id,
      toAccount: toAcc.id,
      amount,
      status: "completed",
      date: new Date(),
    });

    return {
      fromAccount: fromAcc.id,
      toAccount: toAcc.id,
      amount
    };
  });
}
}