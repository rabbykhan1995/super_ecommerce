import { z } from "zod";

export const checkoutOrderSchema = z.object({
  shipping: z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().optional(),
    area: z.string().optional(),
  }),
  note: z.string().optional(),
  paymentMethod: z.enum(["stripe"]),
});