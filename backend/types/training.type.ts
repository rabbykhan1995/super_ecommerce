import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import {
  createTrainingSchema,
  updateTrainingSchema,
  createLevelSchema,
} from "../validators/training.validator";

export interface ILevel extends Document {
  name: string;
}

export interface ITraining extends Document {
  title: string;
  slug: string;
  rating: number;
  price: number;
  duration: number;
  active: boolean;
  description?: string;
  levelID: Types.ObjectId;
  reviewers: number;
  averageReview: number;
  shortDescription?: string;
  thumbnail?: string | null;
  images: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type LevelResponse = HydratedDocument<ILevel>;
export type CreateLevelInput = z.infer<typeof createLevelSchema>;

export type TrainingResponse = HydratedDocument<ITraining>;
export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema>;
export type TrainingListItem = Pick<
  ITraining,
  | "title"
  | "slug"
  | "thumbnail"
  | "createdAt"
  | "shortDescription"
  | "active"
  | "price"
  | "averageReview"
> & {
  _id: Types.ObjectId;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type TrainingListResponse = PaginatedResponse<TrainingListItem>;
