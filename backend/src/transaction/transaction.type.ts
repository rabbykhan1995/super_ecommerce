import z from "zod";
import { createTransactionSchema } from "./transaction.validator";
import { transactionTable, txSourceEnum, txTypeEnum } from "./transaction.table";
import { trxConfig } from "../../utils/builder";
import { AccBalancePayload } from "../account/account.type";


// Exchange means taka ferot.
export type Transaction = typeof transactionTable.$inferSelect;
export type TxSource = (typeof txSourceEnum.enumValues)[number];
export type TxType = (typeof txTypeEnum.enumValues)[number];


export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export type TransactionCreateInput = Omit<Transaction, "id">


export type TransactionPayload = trxConfig & AccBalancePayload;