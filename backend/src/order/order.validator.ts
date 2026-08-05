import { z } from "zod";

const orderItemSchema = z.object({
    productID: z.number().int().min(1, "Product ID is required"),
    variantID: z.number().int().min(1, "Variant ID is required"),
    salePrice: z.number().min(0, "Sale price must be positive"),
    quantity: z.number().min(0.01, "Quantity must be at least 0.01"),
    lineTotal: z.number().min(0).optional(),
    serial: z.string().optional(),
});

export const createOrderSchema = z.object({
    contactID: z.number().int().min(1, "Contact ID is required"),
    shippingName: z.string().min(1, "Shipping name is required"),
    shippingPhone: z.string().min(1, "Shipping phone is required"),
    shippingAddress: z.string().min(1, "Shipping address is required"),
    shippingCity: z.string().optional(),
    shippingArea: z.string().optional(),
    paymentMethod: z.string().optional(),
    note: z.string().optional(),
    orderFrom: z.enum(["Ecommerce", "Manual"]).default("Ecommerce"),
    orderedBy: z.string().optional(),
    items: z
        .array(orderItemSchema)
        .min(1, "At least one order item is required"),
});

export const checkoutOrderSchema = z.object({
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
    status: z.enum(["Pending","Confirmed","Packed","Shipped","Hold","Returned","Cancelled","Delivered"]),
});
