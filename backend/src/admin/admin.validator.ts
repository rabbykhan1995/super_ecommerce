import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissionIds: z.array(z.string().uuid("Invalid permission ID")),
});

export const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid("Invalid permission ID")),
});

export const assignUserRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  roleId: z.string().uuid("Invalid role ID"),
});

export const removeUserRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  roleId: z.string().uuid("Invalid role ID"),
});
