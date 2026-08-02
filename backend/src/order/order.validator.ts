import { z } from "zod";

export const createOrderSchema = z.object({
    shipping: z.object({
        name: z.string().min(1),
        phone: z.string().min(1),
        address: z.string().min(1),
        city: z.string().optional(),
        area: z.string().optional(),
    }),
    note: z.string().optional(),
    paymentMethod: z.enum(["stripe", "cod"]),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(["Pending","Confirmed","Packed","Shipped","Hold","Returned","Cancelled"]),
});
