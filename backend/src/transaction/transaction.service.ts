import mongoose, { ClientSession, Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { AccountService } from "../account/account.service";
import ContactService from "../contact/contact.service";
import { ContactResponse } from "../contact/contact.type";
import TransactionRepository from "./transaction.repository";
import LedgerService from "../ledger/ledger.service";
import PayloadBuilder from "../../utils/builder";
import { runInTransaction } from "../../utils/runTransaction";
import { QueryClient } from "../../drizzle/src";


export default class TransactionService {
    constructor() { }

    static async createTransactionWithLedger(payload: any) {

        const { transaction, accounts } = payload;

        // 1. contact check
        const contact: ContactResponse | null =
            await ContactService.findByID(
                transaction.contactID
            );

        if (!contact) {
            throw new ApiError(404, "Contact didn't found");
        }
        
        runInTransaction(async (tx:QueryClient)=>{
        if (transaction.type === "Credit") {
                await AccountService.increaseBalance(accounts, tx);
            } else {
                await AccountService.decreaseBalance(accounts, tx);
            } 
        })


        // 3. start transaction

        try {

            const transactionPayload =
                PayloadBuilder.transaction(
                    accounts,
                    {
                        groupID,

                        type:
                            transaction.type === "Credit"
                                ? "deposit"
                                : "withdraw",

                        contactID: transaction.contactID,

                        accountField:
                            transaction.type === "Credit"
                                ? "toAccount"
                                : "fromAccount",

                        note: transaction.note,

                        status: "completed",

                        date: transaction.date,
                    }
                );

            const newTransactions =
                await TransactionRepository.createMany(transactionPayload, session
                );

            const ledgerPayload =
                PayloadBuilder.ledger({

                    type:
                        transaction.type === "Credit"
                            ? "payment_in"
                            : "payment_out",

                    typeID: newTransactions[0]._id,

                    typeModel: "Transaction",

                    contactID: contact._id,

                    contactType:
                        contact.type === "both"
                            ? "customer"
                            : contact.type,

                    amount: transaction.amount,

                    paidAmount: transaction.amount,

                    dueAmount: transaction.balanceAfter,

                    note: transaction.note,

                    date: transaction.date,

                    balanceAfter: transaction.balanceAfter,

                    balanceBefore: transaction.balanceBefore,
                });

            // 6. ledger entry
            await LedgerService.create(
                ledgerPayload,
                session
            );

            // 7. update contact balance
            await ContactService.balanceUpdate(
                contact._id,
                transaction.balanceAfter,
                session
            );

            await session.commitTransaction();

            return newTransactions;

        } catch (error) {

            await session.abortTransaction();
            throw error;

        } finally {

            session.endSession();
        }
    }
    static async accountTransactionList(
        query: any
    ) {

        const {
            accountID,
            type
        } = query;

        let filter: Record<string, any> = {};

        // account filter
        if (accountID) {

            filter.$or = [
                {
                    fromAccount:
                        new Types.ObjectId(
                            accountID as string
                        ),
                },
                {
                    toAccount:
                        new Types.ObjectId(
                            accountID as string
                        ),
                },
            ];
        }

        // type filter
        if (type) {
            filter.type = type;
        }

        return TransactionRepository.paginatedList(
            query,
            filter
        );
    }
    static async transactionDetails(
        transactionID: string
    ) {

        // 1. transaction check
        const transaction =
            await TransactionRepository.findById(
                transactionID
            );

        if (!transaction) {
            throw new ApiError(
                404,
                "Transaction not found"
            );
        }

        // 2. ledger check
        const ledger =
            await LedgerService.ledgerByID(
                transaction._id.toString(),
                transaction.groupID?.toString()
            );

        if (!ledger) {
            throw new ApiError(
                404,
                "Transaction Ledger not found"
            );
        }

        // 3. aggregate match query
        const matchQuery =
            transaction.groupID
                ? { groupID: transaction.groupID }
                : { _id: transaction._id };

        // 4. aggregate result
        const result =
            await TransactionRepository.transactionDetailsAggregate(
                matchQuery,
                ledger,
                transaction.groupID
            );

        if (!result) {
            throw new ApiError(
                404,
                "Transaction not found"
            );
        }

        return result;
    }
    static async create(
        payload: any[],
        session?: ClientSession
    ) {
        // 1. group id (if multiple accounts)
        const groupID =
            payload.length > 1
                ? new Types.ObjectId()
                : undefined;

        // 2. build transaction payload
        const transactionPayload = payload.map((acc: any) => ({
            ...(groupID ? { groupID } : {}),
            ...acc
        }));

        // 3. DB insert
        const result =
            await TransactionRepository.createMany(
                transactionPayload,
                session
            );

        if (!result || result.length === 0) {
            throw new Error("Transaction creation failed");
        }

        return result;
    }

    static async deleteTransactions(
        filter: Record<string, any>,
        session?: ClientSession
    ) {
        return TransactionRepository.deleteTransactions(filter, session);
    }
}