import express from "express";
import { adminLoginSchema, checkoutMobileSchema, mobileGoogleAuthSchema, passwordResetSchema, updateUserSchema, userLoginSchema } from "./auth.validator";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthController } from "./auth.controller";
import { validate } from "../../middlewares/validation.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";

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
  .get("/web-logout", authMiddleware, asyncHandler(AuthController.webLogout))
    .get("/device-logout", authMiddleware, asyncHandler(AuthController.deviceLogout))
  .post("/send-email-verify-otp", asyncHandler(AuthController.sendEmailVerifyOTP))
  .post("/register-manually", asyncHandler(AuthController.registerManually))
  .post("/manual-login", validate(userLoginSchema), asyncHandler(AuthController.manualLogin))
  .post("/send-forget-password-otp", asyncHandler(AuthController.sendForgetPasswordOTP))
  .post("/reset-password", validate(passwordResetSchema), asyncHandler(AuthController.resetPassword))
  .post("/checkout-mobile",authMiddleware ,validate(checkoutMobileSchema), asyncHandler(AuthController.checkOutMobile))
  .get("/all-users-list", authMiddleware,adminMiddleware, asyncHandler(AuthController.allUsersList))
    
   


// ===========================
// Customer Google OAuth
// ===========================
router.get("/user-google-auth", asyncHandler(AuthController.getUserGoogleAuthAPI));
router.get("/user-google-callback", asyncHandler(AuthController.userGoogleAuthCallbackAPI));

// ===========================
// Mobile Google Auth
// ===========================
router.post("/mobile-google-auth", validate(mobileGoogleAuthSchema), asyncHandler(AuthController.mobileGoogleAuth));

// ===========================
// Admin / Staff Auth
// ===========================
router.post("/admin-login", validate(adminLoginSchema), asyncHandler(AuthController.adminLogin));
router.get("/admin-google-auth", asyncHandler(AuthController.getAdminGoogleAuth));
router.get("/admin-google-callback", asyncHandler(AuthController.adminGoogleCallback));
router.get("/admin-profile", authMiddleware, asyncHandler(AuthController.getAdminProfile));

export default router;
