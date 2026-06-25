import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createAccountSchema, updateAccountSchema } from "./account.validator";

export interface Account  {
  id:number;
  name: string;
  branch?: string | undefined | null;
  number: string;
  balance: number;
  isDefault:boolean;
}


export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export type AccBalancePayload = {
  accountID: number;
  amount: number;
};

export type AllAccountResponse = Account[];