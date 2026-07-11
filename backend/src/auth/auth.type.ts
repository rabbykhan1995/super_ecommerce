import z from "zod";

import {
  createUserSchema,
  passwordResetSchema,
  updateUserSchema,
  userLoginSchema,
} from "./auth.validator";

import { userTable } from "./auth.table";

export type User = typeof userTable.$inferSelect;

export type UserPayload = typeof userTable.$inferInsert;


export type CreateUserInput = z.infer<typeof createUserSchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type PasswordResetInput = z.infer<typeof passwordResetSchema>

export type UserInToken = Pick<User, "name" | "email" | "mobile"> & {
  id: string;
};

export type UserLoginInput = z.infer<typeof userLoginSchema>;

export interface PaginationQuery {
  search?: string;
  page?: number;
  limit?: number;
}
