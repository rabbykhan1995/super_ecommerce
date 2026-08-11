
import z from "zod";
import {
  createBrandSchema,
  updateBrandSchema,
} from "./brand.validator";
import { brandTable } from "./brand.table";

export type Brand = typeof brandTable.$inferSelect;



export type CreateBrandInput = z.infer<typeof createBrandSchema>;

export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

export type BrandListItem = Pick<
  Brand,
  "name"
> & {
  id: number;
};



export type BrandListResponse = BrandListItem[];
