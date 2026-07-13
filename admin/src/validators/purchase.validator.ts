import { z } from "zod";
import { paymentAccountSchema } from "./sale.validator";

export const purchaseProductSchema = z.object({
  productID: z
    .number()
    .min(1, { message: "Product is required" }),
  variantID: z
    .number()
    .min(1, { message: "Variant is required" }),
  serial: z.string().optional().nullable(),

  purchasedQty: z
    .number({ message: "Quantity must be a number" })
    .min(1, { message: "Quantity must be at least 1" }),

  purchasePrice: z
    .number({ message: "Purchase price must be a number" })
    .min(1, { message: "Purchase price must be greater than 0" }),

  salePrice: z
    .number({ message: "Sale price must be a number" })
    .min(1, { message: "Sale price must be greater than 0" }),
  warranty: z.number({ message: "warranty must be a number" }).optional(),
  expireDate: z
    .coerce
    .date({ message: "Expiry date must be a valid date" })
    .nullable()
    .optional()
    .default(null),
}).superRefine((data, ctx) => {
  if (data.serial && data.warranty === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["warranty"],
      message: "Warranty is required when serial is provided",
    });
  }

  // ✅ expireDate check
  if (data.expireDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.expireDate <= today) {
      ctx.addIssue({
        code: "custom",
        path: ["expireDate"],
        message: "Expiry date must be after today",
      });
    }
  }
});



export const purchaseSchema = z.object({

  supplierID: z
    .number()
    .min(1, { message: "Supplier is required" }),

  note: z.string().optional().nullable(),

  costName: z.string().optional().nullable(),

  totalProductPrice: z
    .number({ message: "Total product price must be a number" })
    .min(0, { message: "Total product price cannot be negative" })
    .default(0),

  otherCost: z
    .number({ message: "Other cost must be a number" })
    .min(0, { message: "Other cost cannot be negative" })
    .default(0),

  discount: z
    .number({ message: "Discount must be a number" })
    .min(0, { message: "Discount cannot be negative" })
    .default(0),

  totalAmount: z
    .number({ message: "Total amount must be a number" })
    .min(0, { message: "Total amount cannot be negative" })
    .default(0),

  paid: z
    .number({ message: "Paid amount must be a number" })
    .min(0, { message: "Paid amount cannot be negative" })
    .default(0),
  exchangeAmount: z
    .number({ message: "Exchange amount must be a number" })
    .min(0, { message: "Exchange amount cannot be negative" })
    .default(0),

  balanceBefore: z
    .number({ message: "Balance before must be a number" })
    .default(0),

  balanceAfter: z
    .number({ message: "Balance after must be a number" })
    .default(0),

  purchaseDate: z
    .coerce
    .date({ message: "Purchase date must be a valid date" }),
})

export const createPurchaseSchema = z.object({

  products: z
    .array(purchaseProductSchema)
    .min(1, { message: "At least one product is required" }),
  accounts: paymentAccountSchema,
  exchangeAccounts:paymentAccountSchema,
  purchase: purchaseSchema
});