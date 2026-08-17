import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createNotificationSchema,
  updateNotificationSchema,
} from "./notification.validator";
import  NotificationController  from "./notification.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";


const router = express.Router();

router
  .post(
    "/create-push-notification",
    validate(createNotificationSchema),
    asyncHandler(NotificationController.create),
  )

  .post("/link-device/:deviceID", authMiddleware,validate(updateNotificationSchema), asyncHandler(NotificationController.linkDevice))

export default router;
