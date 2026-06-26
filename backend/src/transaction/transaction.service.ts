import { ApiError } from "../../utils/ApiError";
import TransactionRepository from "./transaction.repository";
import { QueryClient } from "../../drizzle/src";
import { TransactionPayload, TxSource, TxType } from "./transaction.type";

export default class TransactionService {
    constructor() { }

    static async accountTransactionList(
        query: any
    ) {
        let formattedQuery: any = { page: query.page, limit: query.limit, search: query.search };

        if (query.accountID) {
            formattedQuery.accountID = query.accountID;
        }

        if (query.source) {
            formattedQuery.source = query.source as TxSource;
        }

        if (query.type) {
            formattedQuery.type = query.type as TxType;
        }

        return TransactionRepository.accTransictionList(formattedQuery);
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
        const result = ""

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

    static async findBySourceID(sourceID:number, sourceType:TxSource){
        return TransactionRepository.findBySourceID(sourceID, sourceType);
    }
}