import z from "zod";
import { assignPermissionToRoleSchema, createRoleSchema, removePermissionFromRoleSchema, updateRoleSchema } from "./admin.validator";




export type  CreateRoleInput = z.infer<typeof createRoleSchema>;

export type  UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export type AssignPermissionToRoleInput = z.infer<typeof assignPermissionToRoleSchema>

export type RemovePermissionFromRoleInput = z.infer<typeof removePermissionFromRoleSchema>


export interface UpdateRolePermissionsInput {
  permissionIDs: string[];
}

export interface AssignUserRoleInput {
  userID: string;
  roleID: string;
}

export interface RemoveUserRoleInput {
  userID: string;
  roleID: string;
}
