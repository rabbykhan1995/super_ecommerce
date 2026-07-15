import z from "zod";
import {
  createParcelSchema,
  updateParcelStatusSchema,
  updateParcelSchema,
} from "./parcel.validator";
import { parcelTable } from "./parcel.table";

export type Parcel = typeof parcelTable.$inferSelect;

export type ParcelPayload = typeof parcelTable.$inferInsert;

export type CreateParcelInput = z.infer<typeof createParcelSchema>;

export type UpdateParcelStatusInput = z.infer<typeof updateParcelStatusSchema>;

export type UpdateParcelInput = z.infer<typeof updateParcelSchema>;
