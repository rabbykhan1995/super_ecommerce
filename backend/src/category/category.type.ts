import z from "zod";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validator";
import { categoryTable } from "./category.table";

export interface ICategory extends Document {
  name:string
}

export type Category = typeof categoryTable.$inferSelect;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type CategoryListItem = Pick<
  Category,
  "name"
> & {
  id: number;
};



export type CategoryListResponse = CategoryListItem[];
