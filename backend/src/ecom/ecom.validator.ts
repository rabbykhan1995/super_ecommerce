import { z } from "zod";

export const createBannerSchema = z.object({
    title: z.string().min(1, "Title is required"),
    photo: z.string().min(1, "Photo is required"),
    link: z.string().optional(),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
});

export const updateBannerSchema = z.object({
    title: z.string().min(1).optional(),
    photo: z.string().min(1).optional(),
    link: z.string().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
});

export const createFlashSaleSchema = z.object({
    name: z.string().min(1, "Name is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    isActive: z.boolean().default(true),
});

export const updateFlashSaleSchema = z.object({
    name: z.string().min(1).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const createFlashSaleProductSchema = z.object({
    flashSaleID: z.number().int(),
    productID: z.number().int(),
    discountPrice: z.number().min(0),
    sortOrder: z.number().int().default(0),
});

export const createFeaturedProductSchema = z.object({
    productID: z.number().int(),
    sortOrder: z.number().int().default(0),
});

export const createEcomOrderSchema = z.object({
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
    status: z.enum(["hold", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
});
