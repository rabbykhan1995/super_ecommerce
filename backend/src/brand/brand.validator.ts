import { z } from "zod";

export const createBrandSchema = z.object({
    name: z.string().min(1, "must required"),
});

export const updateBrandSchema = z.object({
    name: z.string().min(1, "must required"),
});
