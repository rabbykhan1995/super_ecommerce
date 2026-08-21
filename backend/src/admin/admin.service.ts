import { ApiError } from "../../utils/ApiError";
import { withTransaction } from "../../utils/withTransaction";
import { AuthService } from "../auth/auth.service";
import { AdminRepository } from "./admin.repository";
import {
  AssignPermissionToRoleInput,
  AssignUserRoleInput,
  CreateRoleInput,
  RemovePermissionFromRoleInput,
  RemoveUserRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from "./admin.type";

export class AdminService {
  static async listPermissions() {
    return AdminRepository.findAllPermissions();
  }

  static async createRole(input: CreateRoleInput) {
    const { name, description } = input;

    const existingRole = await AdminRepository.findRoleByName(name);
    if (existingRole.length > 0) {
      throw new ApiError(400, "Role with this name already exists");
    }

    const role = await AdminRepository.createRole({
      name,
      description: description || "",
      isSuperAdmin: false,
    });


    return role;
  }
  static async updateRole(
    roleID: string,
    input: UpdateRoleInput
  ) {
    if (!!input.name) {
      const existingRole = await AdminRepository.findRoleByName(input.name);

      if (
        existingRole.length > 0 &&
        existingRole[0].id !== roleID
      ) {
        throw new ApiError(
          400,
          "Role with this name already exists"
        );
      }
    }

    const role = await AdminRepository.updateRole(roleID, {
      ...(!!input.name && {
        name: input.name,
      }),

      ...(input.description && {
        description: input.description,
      }),
    });

    return role;
  }

  static async assignPermissionToRole(input: AssignPermissionToRoleInput) {

    const { roleID, permissionIDs } = input;

    const role = await AdminRepository.findRoleBasicById(roleID);
    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    if (role.isSuperAdmin) {
      throw new ApiError(400, "Cannot modify super admin role");
    }

    await AdminRepository.deleteRolePermissionsByRoleId(roleID);

    if (permissionIDs && permissionIDs.length > 0) {
      const rolePermissionValues = permissionIDs.map((permissionID) => ({
        roleID: roleID,
        permissionID,
      }));
      await AdminRepository.assignRolePermissions(rolePermissionValues);
    }
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
    const { userID, roleID } = input;

    const user = await AuthService.findUserByID(userID);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const role = await AdminRepository.findRoleBasicById(roleID);
    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    // One user can have only ONE role.
    // If the user already has a role, it is replaced with the new one (update behavior).
    const existingUserRole = await AdminRepository.findUserRoleByUserId(userID);

    if (existingUserRole) {
      if (existingUserRole.roleID === roleID) {
        throw new ApiError(400, "User already has this role assigned");
      }

      await withTransaction(async (tx) => {
        await AdminRepository.removeAllUserRoles(userID, tx);
        await AdminRepository.assignUserRole({ userID, roleID }, tx);
      });

      return;
    }

    await AdminRepository.assignUserRole({
      userID: userID,
      roleID: roleID,
    });
  }

  static async removeUserRole(input: RemoveUserRoleInput) {
    const { userID, roleID } = input;

    const userRole = await AdminRepository.findUserRole(userID, roleID);
    if (userRole.length === 0) {
      throw new ApiError(404, "User-role assignment not found");
    }

    await AdminRepository.removeUserRole(userID, roleID);
  }

  static async getUserRole(userID: string) {
    const user = await AuthService.findUserByID(userID);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return AdminRepository.findUserRoleByUserId(userID);
  }

  static async getAllStaff(){
    return await AuthService.getAllStaff();
  }
}
