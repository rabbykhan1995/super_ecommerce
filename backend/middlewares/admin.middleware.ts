import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { ApiError } from "../utils/ApiError";
import db from "../drizzle/src";
import { roles, userRole } from "../src/auth/auth.table";
import { UserInToken } from "../src/auth/auth.type";

interface AuthRequest extends Request {
  user?: UserInToken;
}

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new ApiError(401, "Unauthorized request");

    const [row] = await db
      .select({ roleId: roles.id })
      .from(userRole)
      .innerJoin(roles, eq(userRole.roleID, roles.id))
      .where(eq(userRole.userID, req.user.id));

    if (!row) {
      throw new ApiError(403, "Admin access required");
    }

    next();
  } catch (error) {
    next(new ApiError(403, "Admin access required"));
  }
};
