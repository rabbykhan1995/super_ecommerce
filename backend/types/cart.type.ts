import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { updateCartSchema } from "../validators/cart.validator";

export interface ICart extends Document {
  itemID: Types.ObjectId;
  userID: Types.ObjectId;
  itemSlug: string;
  itemTitle: string;
  thumbnail?: string;
  price: number;
  stock: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CartResponse = HydratedDocument<ICart>;

export type UpdateCartInput = z.infer<typeof updateCartSchema>;

export type CartListItem = Pick<
  ICart,
  | "itemID"
  | "itemSlug"
  | "itemTitle"
  | "thumbnail"
  | "price"
  | "quantity"
  | "userID"
  | "stock"
> & {
  _id: Types.ObjectId;
};

export type CartListResponse = {
  items: CartListItem[];
  totalItems: number;
};
