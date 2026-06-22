import { UserInToken } from "../src/auth/user.type";

declare global {
  namespace Express {
    interface Request {
      user?: UserInToken;
    }
  }
}

export {};
