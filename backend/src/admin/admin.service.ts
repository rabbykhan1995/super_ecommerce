import { ApiError } from "../../utils/ApiError";
import { AdminRepository } from "./admin.repository";
import {
  AssignUserRoleInput,
  CreateRoleInput,
  RemoveUserRoleInput,
  UpdateRolePermissionsInput,
} from "./admin.type";

export class AdminService {
  static async listPermissions() {
    return AdminRepository.findAllPermissions();
  }

  static async createRole(input: CreateRoleInput) {
    const { name, description, permissionIds } = input;

    const existingRole = await AdminRepository.findRoleByName(name);
    if (existingRole.length > 0) {
      throw new ApiError(400, "Role with this name already exists");
    }

    const role = await AdminRepository.createRole({
      name,
      description: description || "",
      isSuperAdmin: false,
    });

    if (permissionIds && permissionIds.length > 0) {
      const rolePermissionValues = permissionIds.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      }));
      await AdminRepository.createRolePermissions(rolePermissionValues);
    }

    return role;
  }

  static async listRoles() {
    return AdminRepository.findAllRoles();
  }

  static async getRoleById(id: string) {
    const role = await AdminRepository.findRoleById(id);
    if (!role) {
      throw new ApiError(404, "Role not found");
    }
    return role;
  }

  static async updateRolePermissions(
    id: string,
    input: UpdateRolePermissionsInput
  ) {
    const { permissionIds } = input;

    const role = await AdminRepository.findRoleBasicById(id);
    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    if (role.isSuperAdmin) {
      throw new ApiError(400, "Cannot modify super admin role");
    }

    await AdminRepository.deleteRolePermissionsByRoleId(id);

    if (permissionIds && permissionIds.length > 0) {
      const rolePermissionValues = permissionIds.map((permissionId) => ({
        roleId: id,
        permissionId,
      }));
      await AdminRepository.createRolePermissions(rolePermissionValues);
    }
  }

  static async deleteRole(id: string) {
    const role = await AdminRepository.findRoleBasicById(id);
    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    if (role.isSuperAdmin) {
      throw new ApiError(400, "Cannot delete super admin role");
    }

    const hasUsers = await AdminRepository.hasUsersWithRoleId(id);
    if (hasUsers) {
      throw new ApiError(
        400,
        "Cannot delete role with assigned users. Remove users from this role first."
      );
    }

    await AdminRepository.deleteRole(id);
  }

  static async assignUserRole(input: AssignUserRoleInput) {
    const { userId, roleId } = input;

    const user = await AdminRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const role = await AdminRepository.findRoleBasicById(roleId);
    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    await AdminRepository.assignUserRole({
      userID: userId,
      roleId: roleId,
    });
  }

  static async removeUserRole(input: RemoveUserRoleInput) {
    const { userId, roleId } = input;

    const userRole = await AdminRepository.findUserRole(userId, roleId);
    if (userRole.length === 0) {
      throw new ApiError(404, "User-role assignment not found");
    }

    await AdminRepository.removeUserRole(userId, roleId);
  }

  static async getUserRoles(userId: string) {
    const user = await AdminRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return AdminRepository.findUserRolesByUserId(userId);
  }
}
