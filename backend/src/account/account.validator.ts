import { z } from "zod";


export const createAccountSchema = z.object({
  name: z.string().min(3,"must be 3 character"),
  branch: z.string().min(3,"must be 3 character").optional().nullable(),
  number: z.string("must be a string").min(1, "must be at least 1"),
  default:z.boolean().optional().default(false),
});


export const updateAccountSchema = z.object({
  name: z.string().min(3,"must be 3 character").optional(),
  branch: z.string().min(3,"must be 3 character").optional(),
  number: z.string("must be a string").min(1, "must be at least 1").optional(),
  default:z.boolean().optional().default(false),
});

export const paymentAccountSchema = z.array(z.object({
  accountID: z.number().min(1, "Account is required"),
  amount: z.number({ message: "Amount must be a number" }).min(0.1, { message: "Amount cannot be 0" }),
}));

export const balanceTransferSchema = z.object({
  selectedFrom: z.object({
    id: z.number().min(1, "From account is required"),
  }).strip(),
  selectedTo: z.object({
    id: z.number().min(1, "To account is required"),
  }).strip(),
  amount: z.number().positive("Amount must be greater than 0"),
});