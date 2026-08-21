// middlewares/rbac.middleware.ts
import { Request, Response, NextFunction } from "express";
import { eq, inArray } from "drizzle-orm";
import db from "../drizzle/src";
import {
  userRole,
  roles,
  rolePermissions,
  permissions,
} from "../src/auth/auth.table";
import { ApiError } from "../utils/ApiError";
import { UserInToken } from "../src/auth/auth.type";


interface AuthRequest extends Request {
  user?: UserInToken;
}

/**
 * RBAC middleware.
 * - Must be used AFTER authMiddleware.
 * - If the user has a super-admin role -> always allowed.
 * - Otherwise checks whether any of the user's roles has the given permission.
 * - Pass an empty string "" if you only want "must be logged in + must have
 *   at least one role" without a specific permission check.
 */
export const authorize = (requiredPermission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
      }

      const userID = req.user.id;

      const userRoleRows = await db
        .select({
          roleID: roles.id,
          isSuperAdmin: roles.isSuperAdmin,
        })
        .from(userRole)
        .innerJoin(roles, eq(userRole.roleID, roles.id))
        .where(eq(userRole.userID, userID));

      if (userRoleRows.length === 0) {
        throw new ApiError(403, "No role assigned to this user");
      }

      // Super admin bypass
      const isSuperAdmin = userRoleRows.some((r) => r.isSuperAdmin);
      if (isSuperAdmin) {
        return next();
      }

      // No specific permission required — just needs to be a valid logged-in role
      if (!requiredPermission) {
        return next();
      }

      const roleIDs = userRoleRows.map((r) => r.roleID);

      const permissionRows = await db
        .select({ name: permissions.name })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionID, permissions.id))
        .where(inArray(rolePermissions.roleID, roleIDs));

      const hasPermission = permissionRows.some(
        (p) => p.name === requiredPermission,
      );

      if (!hasPermission) {
        throw new ApiError(
          403,
          `You do not have permission to do this`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};