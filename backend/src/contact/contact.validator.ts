import { z } from "zod";

export const createContactSchema = z.object({
  name:    z.string().min(1, "Name is required"),
  mobile:  z.string().min(1, "Mobile is required"),
  email:   z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  balance: z.number().default(0),
  type:    z.enum(["customer", "supplier", "both"]).default("customer"),
});

export const updateContactSchema = createContactSchema
  .partial()
  .omit({ balance: true });