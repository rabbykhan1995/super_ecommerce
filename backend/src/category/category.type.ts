import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validator";

export interface ICategory extends Document {
  name:string
}

export type CategoryResponse = HydratedDocument<ICategory>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type CategoryListItem = Pick<
  ICategory,
  "name"
> & {
  _id: Types.ObjectId;
};



export type CategoryListResponse = CategoryListItem[];
