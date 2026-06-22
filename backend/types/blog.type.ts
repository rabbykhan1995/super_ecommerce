import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import {
  createBlogSchema,
  updateBlogSchema,
} from "../validators/blog.validator";

export interface IBlog extends Document {
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: string | null;
  images: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type BlogResponse = HydratedDocument<IBlog>;

export type CreateBlogInput = z.infer<typeof createBlogSchema>;

export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;

export type BlogListItem = Pick<
  IBlog,
  "title" | "slug" | "thumbnail" | "createdAt" | "shortDescription"
> & {
  _id: Types.ObjectId;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type BlogListResponse = PaginatedResponse<BlogListItem>;
