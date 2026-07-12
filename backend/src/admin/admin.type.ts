export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRolePermissionsInput {
  permissionIds: string[];
}

export interface AssignUserRoleInput {
  userId: string;
  roleId: string;
}

export interface RemoveUserRoleInput {
  userId: string;
  roleId: string;
}
