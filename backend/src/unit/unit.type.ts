import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import {
  createUnitSchema,
  updateUnitSchema,
} from "./unit.validator";

export interface IUnit extends Document {
  name:string
}

export type UnitResponse = HydratedDocument<IUnit>;

export type CreateUnitInput = z.infer<typeof createUnitSchema>;

export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

export type UnitListItem = Pick<
  IUnit,
  "name"
> & {
  _id: Types.ObjectId;
};



export type UnitListResponse = UnitListItem[];
