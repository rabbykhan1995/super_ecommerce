import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createContactSchema, updateContactSchema } from "./contact.validator";

export interface IContact extends Document {
  name: string;
  email?: string;
  mobile: string;
  balance: number;
  address?: string;
  type: "customer" | "supplier" | "both";
}

export type ContactResponse = HydratedDocument<IContact>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;