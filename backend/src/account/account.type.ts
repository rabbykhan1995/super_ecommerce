import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createAccountSchema, updateAccountSchema } from "./account.validator";

export interface IAccount extends Document {
  name: string;
  branch?: string;
  number: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  default:boolean;
}

export type AccountResponse = HydratedDocument<IAccount>;

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export type AccBalancePayload = {
  accountID: string;
  amount: number;
};

export type AllAccountResponse = AccountResponse[];