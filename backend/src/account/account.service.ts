import AccountRepository from "./account.repository";
import { AccBalancePayload, Account, CreateAccountInput, UpdateAccountInput } from "./account.type";
import { ApiError } from "../../utils/ApiError";
import { withTransaction } from "../../utils/withTransaction";
import { QueryClient } from "../../drizzle/src";
import PayloadBuilder from "../../utils/builder";

import TransactionService from "../transaction/transaction.service";

export class AccountService {

    static async increaseBalance(
        accounts: AccBalancePayload[],
        tx?: QueryClient
    ) {
        await AccountRepository.increaseAccountsAmount(
            accounts,
            tx
        );
    }

    static async decreaseBalance(
        accounts: AccBalancePayload[],
        tx?: QueryClient
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

        if (payload.isDefault === true) {

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

        if (payload.isDefault === true) {
            const exist = await AccountRepository.findDefault(accountID);// ✅ id দিয়ে বাদ দাও
            if (exist) throw new ApiError(400, "Default account already exists");
        }

        const updatedAccount: Account | null = await AccountRepository.updateById(accountID, payload) // ✅ create না, update
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

        return await withTransaction(async (tx: QueryClient) => {

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

            const balanceTransfer = await AccountRepository.createBalanceTransfer({ date: payload.date, fromAccountID: fromAcc.id, toAccountID: toAcc.id, amount }, tx);

            if (!balanceTransfer) {
                throw new ApiError(400, "balance transfer failed")
            }

            const fromtransactionPayload = PayloadBuilder.transaction(selectedFrom, { type: "debit", date: payload.date, source: "balance_transfer", balanceTransferID: balanceTransfer.id });

            const totransactionPayload = PayloadBuilder.transaction(selectedTo, { type: "credit", date: payload.date, source: "balance_transfer", balanceTransferID: balanceTransfer.id });

            await Promise.all([TransactionService.create(fromtransactionPayload, tx), TransactionService.create(totransactionPayload, tx)]);

            return balanceTransfer;
        });
    }
}