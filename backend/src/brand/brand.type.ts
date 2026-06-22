import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import {
  createBrandSchema,
  updateBrandSchema,
} from "./brand.validator";

export interface IBrand extends Document {
  name:string
}

export type BrandResponse = HydratedDocument<IBrand>;

export type CreateBrandInput = z.infer<typeof createBrandSchema>;

export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

export type BrandListItem = Pick<
  IBrand,
  "name"
> & {
  _id: Types.ObjectId;
};



export type BrandListResponse = BrandListItem[];
