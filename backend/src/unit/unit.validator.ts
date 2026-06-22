import { z } from "zod";

export const createUnitSchema = z.object({
    name: z.string().min(1, "must required"),
});

export const updateUnitSchema = z.object({
    name: z.string().min(1, "must required"),
});
