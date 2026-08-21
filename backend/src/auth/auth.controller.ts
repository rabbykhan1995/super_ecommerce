import { Request, Response } from "express";

import { AuthService } from "./auth.service";
import NotificationService from "../notification/notification.service";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};
export class AuthController {
  static async sendEmailVerifyOTP(req: Request, res: Response) {
    const email: string = req.body.email;

    await AuthService.sendEmailVerifyOTP(email);

    return res
      .status(200)
      .json({ msg: "OTP sent successfully", success: true });

  }
  static async registerManually(req: Request, res: Response) {
    const { token, user } = await AuthService.registerManually(req.body);
    // Cookie সেট
    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      success: true,
      msg: "Registration successful",
      data: user,
      token,
    });
  }

  static async getProfileData(req: Request, res: Response) {

    const userID: string = req.user!.id;

    const user = await AuthService.getProfileData(userID);

    return res
      .status(200)
      .json({ msg: "user fetched successfully", data: user, success: true });
  }



  static async sendForgetPasswordOTP(req: Request, res: Response) {
    const email: string = req.body.email;

    await AuthService.sendForgetPasswordOTP(email);

    return res
      .status(200)
      .json({ msg: "OTP sent successfully", success: true });
  }

  static async resetPassword(req: Request, res: Response) {

    const { token, user } = await AuthService.resetPassword(req.body);
    // Cookie সেট
    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      success: true,
      msg: "Password reset successful",
      data: user,
      token,
    });
  }

  static async manualLogin(req: Request, res: Response) {

    const { user, token } = await AuthService.manualLogin(req.body);
    // Cookie সেট
    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      success: true,
      msg: "Login successful",
      data: user,
      token,
    });
  }

  static async getUserGoogleAuthAPI(req: Request, res: Response) {
    const redirectURL = AuthService.getUserGoogleAuthAPI();

    res.redirect(redirectURL);
  }

  static async userGoogleAuthCallbackAPI(req: Request, res: Response) {
    const { token, clientRedirectURL } = await AuthService.userGoogleAuthCallbackAPI(req.query);

    res.cookie("token", token, cookieOptions);

    res.redirect(`${clientRedirectURL}`);
    res.status(200).json({
      success: true,
      msg: "Google login successful",
      token,
    });
  }

  static async webLogout(req: Request, res: Response) {

    res.clearCookie("token", cookieOptions);

    return res
      .status(200)
      .json({ msg: "user logged out successfully", success: true });
  }

    static async allUsersList(req: Request, res: Response) {

    const result = await AuthService.allUsersList(req.query);

    return res
      .status(200)
      .json({ success: true, data:result });
  }

  static async deviceLogout(req: Request, res: Response) {
    // Mobile app theke pathano hobe (local storage e already save kora deviceID)
    // Web/browser theke logout korle deviceID undefined thakbe - eta normal, শুধু skip hobe
    const { deviceID } = req.body as { deviceID?: string };

    if (deviceID) {
      try {
        await NotificationService.update(deviceID, { userID: null });
      } catch (err) {
        // Notification unlink fail korleo logout block hobe na - eta secondary operation
        console.error("Failed to unlink device on logout:", err);
      }
    }

    res.clearCookie("token", cookieOptions);

    return res
      .status(200)
      .json({ msg: "user logged out successfully", success: true });
  }

  static async checkOutMobile(req: Request, res: Response) {
    const userID = req.user!.id;
    const mobile = req.body.mobile;
    const address = req.body.address;

    await AuthService.checkOutMobile(userID, mobile, address);

    return res
      .status(200)
      .json({ msg: "Checkout successfully", success: true });
  }

  // ===========================
  // Admin / Staff Auth
  // ===========================

  static async adminLogin(req: Request, res: Response) {
    const { token, user } = await AuthService.adminLogin(req.body);

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      msg: "Admin login successful",
      data: user,
      token,
    });
  }

  static async getAdminGoogleAuth(req: Request, res: Response) {
    const redirectURL = AuthService.getAdminGoogleAuthURL();
    res.redirect(redirectURL);
  }

  static async getAdminProfile(req: Request, res: Response) {
    const userID: string = req.user!.id;

    const user = await AuthService.getAdminProfile(userID);

    return res.status(200).json({
      success: true,
      msg: "Admin profile fetched successfully",
      data: user,
    });
  }

  static async mobileGoogleAuth(req: Request, res: Response) {
    const { token, user } = await AuthService.mobileGoogleAuth(req.body.idToken);

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      msg: "Google login successful",
      data: user,
      token,
    });
  }

  static async adminGoogleCallback(req: Request, res: Response) {
    const { token, user, clientRedirectURL } = await AuthService.adminGoogleCallback(req.query);

    res.cookie("token", token, cookieOptions);

    res.redirect(`${clientRedirectURL}?token=${token}`);
  }

}
