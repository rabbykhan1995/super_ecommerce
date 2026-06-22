import z from "zod";

export const createLedgerSchema = z.object({
  type: z.enum([
    "sale",
    "purchase",
    "payment_in",
    "payment_out",
    "sale_return",
    "purchase_return",
  ]),
  typeID: z.string().optional(),
  typeModel: z.enum(["Sale", "Purchase", "Transaction"]).optional(),
  contactID: z.string().min(1, "Contact ID required"),
  contactType: z.enum(["customer", "supplier"]),
  amount: z.number().positive("Amount must be positive"),
  discount: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  dueAmount: z.number().min(0).optional(),
  balanceAfter: z.number().min(0).optional(),
  balanceBefore: z.number().min(0).optional(),
  note: z.string().trim().optional(),
  date: z.coerce.date().optional(),
});

export const updateLedgerSchema = createLedgerSchema.partial();