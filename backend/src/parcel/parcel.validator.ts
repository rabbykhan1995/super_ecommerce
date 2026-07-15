import { z } from "zod";

export const createParcelSchema = z.object({
  saleID: z
    .number({ message: "Sale ID is required" })
    .int()
    .positive({ message: "Sale ID must be a positive number" }),

  address: z
    .string({ message: "Address is required" })
    .min(1, { message: "Address is required" }),

  parcelType: z.enum(["local", "international"]).default("local"),

  courierName: z.string().optional().nullable(),

  thirdPartyTrackingNo: z.string().optional().nullable(),

  localParcelNo: z.string().optional().nullable(),

  note: z.string().optional().nullable(),

  shippingCost: z
    .number({ message: "Shipping cost must be a number" })
    .min(0, { message: "Shipping cost cannot be negative" })
    .default(0),

  codAmount: z
    .number({ message: "COD amount must be a number" })
    .min(0, { message: "COD amount cannot be negative" })
    .default(0),

  dueAmount: z
    .number({ message: "Due amount must be a number" })
    .min(0, { message: "Due amount cannot be negative" })
    .default(0),

  parcelDate: z.coerce.date({ message: "Parcel date must be a valid date" }),
});

export const updateParcelStatusSchema = z.object({
  status: z.enum(
    ["pending", "picked", "in_transit", "delivered", "returned", "cancelled"],
    { message: "Invalid status value" }
  ),
});

export const updateParcelSchema = z.object({
  address: z.string().min(1, { message: "Address is required" }).optional(),

  parcelType: z.enum(["local", "international"]).optional(),

  courierName: z.string().optional().nullable(),

  thirdPartyTrackingNo: z.string().optional().nullable(),

  localParcelNo: z.string().optional().nullable(),

  note: z.string().optional().nullable(),

  shippingCost: z
    .number()
    .min(0, { message: "Shipping cost cannot be negative" })
    .optional(),

  codAmount: z
    .number()
    .min(0, { message: "COD amount cannot be negative" })
    .optional(),

  dueAmount: z
    .number()
    .min(0, { message: "Due amount cannot be negative" })
    .optional(),
});
