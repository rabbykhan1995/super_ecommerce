import { z } from "zod";
import { Types } from "mongoose";

const objectId = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), { message: "Invalid ObjectId" });

export const createWarrantySchema = z.object({
  saleID: objectId,
  supplierID: objectId,
  customerID: objectId.nullable().default(null),
  productID: objectId,
  batchID: objectId,
  serial: z.string().trim().nullable().default(null),
  salePrice: z.number().min(0).default(0),
  warranty: z.number().min(0).default(0),
  saleDate: z.coerce.date(),
  expireDate: z.coerce.date().nullable().default(null),
  note: z.string().trim().optional(),
});

export type CreateWarrantyInput = z.infer<typeof createWarrantySchema>;

export const updateWarrantySchema = z.object({
  status: z.enum([
    "sold",
    "claimed",
    "sent_to_supplier",
    "received_from_supplier",
    "repaired",
    "replaced",
    "new_serial_assigned",
    "rejected",
    "returned_to_customer",
    "refunded",
  ]).optional(),

  // Claim
  claimDate: z.coerce.date().nullable().optional(),
  issueDescription: z.string().trim().optional(),

  // Supplier
  supplierID: objectId.optional(),
  sentDate: z.coerce.date().nullable().optional(),
  receivedDate: z.coerce.date().nullable().optional(),
  supplierNote: z.string().trim().optional(),

  // Replace
  replacedSerial: z.string().trim().nullable().optional(),
  replacedBatchID: objectId.nullable().optional(),

  // Refund / Cost
  refundAmount: z.number().min(0).optional(),
  otherCost: z.number().min(0).optional(),
  accounts: z.array(
    z.object({
      accountID: objectId,
      amount: z.number(),
    })
  ).optional(),

  resolvedDate: z.coerce.date().nullable().optional(),
  note: z.string().trim().optional(),
});

export type UpdateWarrantyInput = z.infer<typeof updateWarrantySchema>;