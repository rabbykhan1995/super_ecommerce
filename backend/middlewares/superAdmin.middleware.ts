import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { ApiError } from "../utils/ApiError";
import db from "../drizzle/src";
import { roles, userRoles } from "../src/auth/auth.table";
import { UserInToken } from "../src/auth/auth.type";


interface AuthRequest extends Request {
  user?: UserInToken;
}

export const superAdminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized request");

    const [row] = await db
      .select({ isSuperAdmin: roles.isSuperAdmin })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userID, req.user.id)); // <-- userID na, userID (schema te camelCase 'userID')

    if (!row?.isSuperAdmin) {
      throw new ApiError(403, "Super admin access required");
    }

    next();
  } catch (error) {
    res.clearCookie("token");
    next(new ApiError(403, "Super admin access required"));
  }
};