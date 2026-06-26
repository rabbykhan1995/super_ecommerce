import mongoose, { ClientSession, Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { AccountService } from "../account/account.service";
import ContactService from "../contact/contact.service";
import { ContactResponse } from "../contact/contact.type";
import TransactionRepository from "./transaction.repository";
import LedgerService from "../ledger/ledger.service";
import PayloadBuilder from "../../utils/builder";
import { withTransaction } from "../../utils/withTransaction";
import { QueryClient } from "../../drizzle/src";
import { text } from "stream/consumers";
import { TransactionCreateInput, TransactionPayload } from "./transaction.type";


export default class TransactionService {
    constructor() { }

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
  
        );
    }
    static async transactionDetails(
        transactionID: number
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

        // 3. aggregate match query
        // 4. aggregate result
        const result =""

        if (!result) {
            throw new ApiError(
                404,
                "Transaction not found"
            );
        }

        return result;
    }
    static async create(
        payload: TransactionPayload,
        tx?: QueryClient
    ) {


        // 2. build transaction payload

        // 3. DB insert
        const result =
            await TransactionRepository.create(
                payload,
                tx
            );

        if (!result || result.length === 0) {
            throw new Error("Transaction creation failed");
        }

        return result;
    }

    static async deleteTransactions(
        filter: Record<string, any>,
        tx?: QueryClient
    ) {
        return TransactionRepository.deleteTransactions(filter, tx);
    }
}