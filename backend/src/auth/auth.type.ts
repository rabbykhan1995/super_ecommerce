import z from "zod";

import {
  createUserSchema,
  passwordResetSchema,
  updateUserSchema,
  userLoginSchema,
  adminLoginSchema,
  createStaffProfileSchema,
  updateStaffProfileSchema,
} from "./auth.validator";

import { roles, userTable, permissions, staffProfiles } from "./auth.table";

export type User = typeof userTable.$inferSelect;

export type UserPayload = typeof userTable.$inferInsert;

export type Roles = typeof roles.$inferSelect;

export type Permissions = typeof permissions.$inferSelect;

export type CreateUserInput = z.infer<typeof createUserSchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type PasswordResetInput = z.infer<typeof passwordResetSchema>

export type UserInToken = Pick<User, "name" | "email" | "mobile"> & {
  id: string;
};

export type StaffProfile = typeof staffProfiles.$inferSelect;

export type CreateStaffInput = z.infer<typeof createStaffProfileSchema>

export type UpdateStaffInput = z.infer<typeof updateStaffProfileSchema>

export type UserLoginInput = z.infer<typeof userLoginSchema>;

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export interface PaginationQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserWithRoles {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  image: string | null;
  roles: { id: string; name: string; isSuperAdmin: boolean }[];
  permissions: string[];
  isSuperAdmin: boolean;
  staffProfile: {
    employeeCode: number;
    designation: string | null;
    department: string | null;
  } | null;
}
