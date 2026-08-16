import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createNotificationSchema,
} from "./notification.validator";
import  NotificationController  from "./notification.controller";


const router = express.Router();

router
  .post(
    "/create-push-notification",
    validate(createNotificationSchema),
    asyncHandler(NotificationController.create),
  )

export default router;
