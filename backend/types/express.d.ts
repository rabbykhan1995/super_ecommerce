import { UserInToken } from "../src/auth/auth.type";

declare global {
  namespace Express {
    interface Request {
      user?: UserInToken;
    }
  }
}

export {};
