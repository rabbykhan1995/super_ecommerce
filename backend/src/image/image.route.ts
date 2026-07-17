import express from "express";
import { ImageController } from "./image.controller";
import { upload } from "../../config/imagekit.config";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = express.Router();

router
  .post(
    "/upload",
    authMiddleware,
    adminMiddleware,
    upload.array("files"),
    asyncHandler(ImageController.uploadImages),
  )
  .post(
    "/delete",
    authMiddleware,
    adminMiddleware,
    asyncHandler(ImageController.deleteImage),
  );

export default router;
