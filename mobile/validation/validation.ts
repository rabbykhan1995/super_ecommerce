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

export const checkoutMobileSchema = z.object({
  address: z
    .string()
    .min(6, "address must be at least 6 characters").nonempty(),
  mobile: z
    .string()
    .min(1, "mobile is required")
    .refine((val) => {
      // email regex
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // mobile regex (Bangladesh 01XXXXXXXXX)
      const mobileRegex =
        /^(?:\+88)?01[3-9]\d{8}$/;

      return emailRegex.test(val) || mobileRegex.test(val);
    }, "mobile must be a valid number"),
});
