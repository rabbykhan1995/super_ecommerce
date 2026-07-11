import { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import db from "../../drizzle/src";
import {
  roles,
  permissions,
  rolePermissions,
  userRoles,
  userTable,
} from "../auth/auth.table";
import { ApiError } from "../../utils/ApiError";

export class AdminController {
  // ===========================
  // Permissions
  // ===========================

  static async listPermissions(req: Request, res: Response) {
    const allPermissions = await db.select().from(permissions);
    res.status(200).json({ success: true, data: allPermissions });
  }

  // ===========================
  // Roles CRUD
  // ===========================

  static async createRole(req: Request, res: Response) {
    const { name, description, permissionIds } = req.body;

    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);

    if (existingRole.length > 0) {
      throw new ApiError(400, "Role with this name already exists");
    }

    const [role] = await db
      .insert(roles)
      .values({
        name,
        description,
        isSuperAdmin: false,
      })
      .returning();

    if (permissionIds && permissionIds.length > 0) {
      const rolePermissionValues = permissionIds.map((permissionId: string) => ({
        roleId: role.id,
        permissionId,
      }));

      await db.insert(rolePermissions).values(rolePermissionValues);
    }

    res.status(201).json({
      success: true,
      data: role,
      msg: "Role created successfully",
    });
  }

  static async listRoles(req: Request, res: Response) {
    const allRoles = await db.query.roles.findMany({
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    });

    res.status(200).json({ success: true, data: allRoles });
  }

  static async getRoleById(req: Request, res: Response) {
    const { id } = req.params;

    const role = await db.query.roles.findFirst({
      where: (r, { eq }) => eq(r.id, id as string),
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    res.status(200).json({ success: true, data: role });
  }

  static async updateRolePermissions(req: Request, res: Response) {
    const { id } = req.params;
    const { permissionIds } = req.body;

    const role = await db.query.roles.findFirst({
      where: (r, { eq }) => eq(r.id, id as string),
    });

    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    if (role.isSuperAdmin) {
      throw new ApiError(400, "Cannot modify super admin role");
    }

    // Delete existing role permissions
    await db
      .delete(rolePermissions)
      .where(eq(rolePermissions.roleId, id as string));

    // Insert new role permissions
    if (permissionIds && permissionIds.length > 0) {
      const rolePermissionValues = permissionIds.map((permissionId: string) => ({
        roleId: id,
        permissionId,
      }));

      await db.insert(rolePermissions).values(rolePermissionValues);
    }

    res.status(200).json({
      success: true,
      msg: "Role permissions updated successfully",
    });
  }

  static async deleteRole(req: Request, res: Response) {
    const { id } = req.params;

    const role = await db.query.roles.findFirst({
      where: (r, { eq }) => eq(r.id, id as string),
    });

    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    if (role.isSuperAdmin) {
      throw new ApiError(400, "Cannot delete super admin role");
    }

    // Check if any users are assigned to this role
    const usersWithRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.roleId, id as string))
      .limit(1);

    if (usersWithRole.length > 0) {
      throw new ApiError(
        400,
        "Cannot delete role with assigned users. Remove users from this role first."
      );
    }

    await db.delete(roles).where(eq(roles.id, id as string));

    res.status(200).json({
      success: true,
      msg: "Role deleted successfully",
    });
  }

  // ===========================
  // User-Role Assignment
  // ===========================

  static async assignUserRole(req: Request, res: Response) {
    const { userId, roleId } = req.body;

    const user = await db.query.userTable.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const role = await db.query.roles.findFirst({
      where: (r, { eq }) => eq(r.id, roleId),
    });

    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    await db
      .insert(userRoles)
      .values({
        userID: userId,
        roleId: roleId,
      })
      .onConflictDoNothing();

    res.status(201).json({
      success: true,
      msg: "Role assigned to user successfully",
    });
  }

  static async removeUserRole(req: Request, res: Response) {
    const { userId, roleId } = req.body;

    const userRole = await db
      .select()
      .from(userRoles)
      .where(
        and(eq(userRoles.userID, userId), eq(userRoles.roleId, roleId))
      )
      .limit(1);

    if (userRole.length === 0) {
      throw new ApiError(404, "User-role assignment not found");
    }

    await db
      .delete(userRoles)
      .where(
        and(eq(userRoles.userID, userId), eq(userRoles.roleId, roleId))
      );

    res.status(200).json({
      success: true,
      msg: "Role removed from user successfully",
    });
  }

  static async getUserRoles(req: Request, res: Response) {
    const { userId } = req.params;

    const user = await db.query.userTable.findFirst({
      where: (u, { eq }) => eq(u.id, userId as string),
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const userRolesData = await db.query.userRoles.findMany({
      where: (ur, { eq }) => eq(ur.userID, userId as string),
      with: {
        role: {
          with: {
            rolePermissions: {
              with: {
                permission: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({ success: true, data: userRolesData });
  }
}
