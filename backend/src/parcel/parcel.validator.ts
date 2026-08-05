import { z } from "zod";
import { paymentAccountSchema } from "../account/account.validator";

const orderPackItemSchema = z.object({
  productID: z.number().int().min(1, { message: "Product ID is required" }),
  variantID: z.number().int().min(1, { message: "Variant ID is required" }),
  batchID: z.number().int().positive().optional().nullable(),
  quantity: z
    .number({ message: "Quantity must be a number" })
    .min(0.01, { message: "Quantity must be at least 0.01" }),
  salePrice: z
    .number({ message: "Sale price must be a number" })
    .min(0, { message: "Sale price must be positive" }),
  warranty: z.number().int().optional().nullable(),
});

export const createOrderPackSchema = z.object({
  orderID: z
    .number({ message: "Order ID is required" })
    .int()
    .positive({ message: "Order ID must be a positive number" }),

  items: z
    .array(orderPackItemSchema)
    .min(1, { message: "At least one item is required" }),

  paid: z
    .number({ message: "Paid amount must be a number" })
    .min(0, { message: "Paid amount cannot be negative" })
    .default(0),

  discount: z
    .number({ message: "Discount must be a number" })
    .min(0, { message: "Discount cannot be negative" })
    .default(0),

  note: z.string().optional().nullable(),

  costName: z.string().optional().nullable(),

  accounts: paymentAccountSchema.default([]),

  exchangeAccounts: paymentAccountSchema.default([]),

  parcelType: z.enum(["local", "international"]).default("local"),

  courierName: z.string().optional().nullable(),

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
    ["Packed","Shipped","Hold","Delivered","Returned","Cancelled"],
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
