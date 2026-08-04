import { z } from "zod";

const orderItemSchema = z.object({
    productID: z.number().int().min(1, "Product ID is required"),
    variantID: z.number().int().min(1, "Variant ID is required"),
    productName: z.string().min(1, "Product name is required"),
    variantAttrs: z
        .array(
            z.object({
                name: z.string().min(1),
                value: z.string().min(1),
            })
        )
        .optional(),
    thumbnail: z.string().optional(),
    salePrice: z.number().min(0, "Sale price must be positive"),
    discountPrice: z.number().min(0).optional(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
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
