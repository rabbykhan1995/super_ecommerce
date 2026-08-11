import z from "zod";
import {
  createUnitSchema,
  updateUnitSchema,
} from "./unit.validator";
import { unitTable } from "./unit.table";

export type Unit = typeof unitTable.$inferSelect;

export type CreateUnitInput = z.infer<typeof createUnitSchema>;

export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

export type UnitListItem = Pick<
  Unit,
  "name"
> & {
  id: number;
};



export type UnitListResponse = UnitListItem[];
