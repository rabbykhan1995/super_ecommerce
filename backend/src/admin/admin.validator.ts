import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, "Role name is required").nullable().optional(),
  description: z.string().optional().nullable(),
});

export const updateRolePermissionsSchema = z.object({
  permissionIDs: z.array(z.string().uuid("Invalid permission ID")),
});

export const assignPermissionToRoleSchema = z.object({
  permissionIDs: z
    .array(z.string().uuid("Invalid permission ID"))
    .min(1, "At least one permission ID is required"),
  roleID: z.string().uuid("Invalid role ID"),
});

export const removePermissionFromRoleSchema = z.object({
  permissionIDs: z
    .array(z.string().uuid("Invalid permission ID"))
    .min(1, "At least one permission ID is required"),
  roleID: z.string().uuid("Invalid role ID"),
});

export const assignUserRoleSchema = z.object({
  userID: z.string().uuid("Invalid user ID"),
  roleID: z.string().uuid("Invalid role ID"),
});

export const removeUserRoleSchema = z.object({
  userID: z.string().uuid("Invalid user ID"),
  roleID: z.string().uuid("Invalid role ID"),
});
