import { Request, Response, NextFunction } from "express";
import { UserInToken, UserResponse } from "../src/auth/user.type";
import { ApiError } from "../utils/ApiError";
import User from "../src/auth/user.model";
import { Types } from "mongoose";

interface AuthRequest extends Request {
  user?: UserInToken;
}

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1️⃣ Token from header (Authorization: Bearer <token>)
    const userID: Types.ObjectId = req.user!._id;
    const user: UserResponse | null = await User.findById(userID);

    if (!user) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (!user.admin) {
      throw new ApiError(401, "Unauthorized request");
    }
    // 4️⃣ Attach user to request
    req.user = user;
    next();
  } catch (error: any) {
    res.clearCookie("token");
    next(new ApiError(401, "Unauthorized request"));
  }
};
