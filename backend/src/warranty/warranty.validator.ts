import { z } from "zod";

export const createWarrantySchema = z.object({
  saleID: z.number(),
  supplierID: z.number(),
  customerID: z.number().nullable().default(null),
  productID: z.number(),
  batchID: z.number(),
  serial: z.string().trim().nullable().default(null),
  salePrice: z.number().min(0).default(0),
  warranty: z.number().min(0).default(0),
  saleDate: z.coerce.date(),
  expireDate: z.coerce.date().nullable().default(null),
  note: z.string().trim().optional(),
});

export type CreateWarrantyInput = z.infer<typeof createWarrantySchema>;

export const updateWarrantySchema = z.object({
  status: z
    .enum([
      "sold",
      "claimed",
      "sent_to_supplier",
      "received_from_supplier",
      "repaired",
      "replaced",
      "rejected",
      "returned_to_customer",
      "refunded",
    ])
    .optional(),

  // Claim
  claimDate: z.coerce.date().nullable().optional(),
  issueDescription: z.string().trim().optional(),

  // Supplier
  supplierID: z.number().optional(),
  sentDate: z.coerce.date().nullable().optional(),
  receivedDate: z.coerce.date().nullable().optional(),
  supplierNote: z.string().trim().optional(),

  // Replace
  replacedSerial: z.string().trim().nullable().optional(),
  replacedBatchID: z.number().nullable().optional(),

  // Refund / Cost
  refundAmount: z.number().min(0).optional(),
  otherCost: z.number().min(0).optional(),
  accounts: z
    .array(
      z.object({
        accountID: z.number(),
        amount: z.number(),
      })
    )
    .optional(),

  resolvedDate: z.coerce.date().nullable().optional(),
  note: z.string().trim().optional(),
});

export type UpdateWarrantyInput = z.infer<typeof updateWarrantySchema>;