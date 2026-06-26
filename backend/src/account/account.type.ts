import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createAccountSchema, updateAccountSchema } from "./account.validator";
import { accountTable } from "./account.table";

export type Account = typeof accountTable.$inferSelect;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export type AccBalancePayload = {
  accountID: number;
  amount: number;
};

export type AllAccountResponse = Account[];


export type BalanceTransferInput = {
          fromAccountID: number; // কোন একাউন্ট (ক্যাশ বক্স, ব্যাংক, ইত্যাদি)
  
          toAccountID: number; 
          amount:number; 
  
          date: Date; 
}

