import express from "express";
import { adminLoginSchema, checkoutMobileSchema, passwordResetSchema, userLoginSchema } from "./auth.validator";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthController } from "./auth.controller";
import { validate } from "../../middlewares/validation.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

// ===========================
// Customer Auth
// ===========================
router
  .get(
    "/get-profile",
    authMiddleware,
    asyncHandler(AuthController.getProfileData),
  )
  .get("/logout", authMiddleware, asyncHandler(AuthController.logout))
  .post("/send-email-verify-otp", asyncHandler(AuthController.sendEmailVerifyOTP))
  .post("/register-manually", asyncHandler(AuthController.registerManually))
  .post("/manual-login", validate(userLoginSchema), asyncHandler(AuthController.manualLogin))
  .post("/send-forget-password-otp", asyncHandler(AuthController.sendForgetPasswordOTP))
  .post("/reset-password", validate(passwordResetSchema), asyncHandler(AuthController.resetPassword))
  .post("/checkout-mobile", validate(checkoutMobileSchema), asyncHandler(AuthController.checkOutMobile))

// ===========================
// Customer Google OAuth
// ===========================
router.get("/google-auth", asyncHandler(AuthController.getGoogleAuthAPI));
router.get("/user-google-callback", asyncHandler(AuthController.googleAuthCallbackAPI));

// ===========================
// Admin / Staff Auth
// ===========================
router.post("/admin-login", validate(adminLoginSchema), asyncHandler(AuthController.adminLogin));
router.get("/admin-google-auth", asyncHandler(AuthController.getAdminGoogleAuth));
router.get("/admin-google-callback", asyncHandler(AuthController.adminGoogleCallback));

export default router;
