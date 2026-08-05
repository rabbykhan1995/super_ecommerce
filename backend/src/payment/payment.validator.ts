import { z } from "zod";

export const paymentAccountSchema = z.array(
  z.object({
    accountID: z.number().min(1, "Account ID is required"),
    amount: z.number().positive("Amount must be greater than 0"),
  })
);

export const createPaymentSchema = z.object({
  contactID: z.number().min(1, "Contact ID is required"),
  type: z.enum(["customer_receive", "customer_pay", "supplier_pay", "supplier_receive"], {
    message: "Payment type is required",
  }),
  accounts: paymentAccountSchema.min(1, "At least one account is required"),
  note: z.string().nullable().optional(),
  paymentDate: z.coerce.date().default(() => new Date()),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentAccountInput = z.infer<typeof paymentAccountSchema>;
