import { Request, Response } from "express";

import { AuthService } from "./auth.service";

export class AuthController {

  static async registerManually(req: Request, res: Response) {
    const { token, user } = await AuthService.registerManually(req.body);
    // Cookie সেট
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
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

  static async sendEmailVerifyOTP(req: Request, res: Response) {
    const email: string = req.body.email;

    await AuthService.sendEmailVerifyOTP(email);

    return res
      .status(200)
      .json({ msg: "OTP sent successfully", success: true });

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
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
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
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(201).json({
      success: true,
      msg: "Login successful",
      data: user,
      token,
    });
  }

  static async getGoogleAuthAPI(req: Request, res: Response) {
    const redirectURL = AuthService.getGoogleAuthAPI();

    res.redirect(redirectURL);
  }

  static async googleAuthCallbackAPI(req: Request, res: Response) {
    const { token, clientRedirectURL } = await AuthService.googleAuthCallbackAPI(req.query);

    res.cookie("token", token, { httpOnly: true });

    res.redirect(`${clientRedirectURL}`);
  }

  static async logout(req: Request, res: Response) {

    res.clearCookie("token");

    return res
      .status(200)
      .json({ msg: "user logged out successfully", success: true });
  }

  static async checkOutMobile(req: Request, res: Response) {
    const userID = req.user.id;
    const mobile = req.body.mobile;
    const address = req.body.address;

    await AuthService.checkOutMobile(userID, mobile, address);

    return res
      .status(200)
      .json({ msg: "Checkout successfully", success: true });
  }
}
