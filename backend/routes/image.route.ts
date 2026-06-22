import { Router } from "express";
import { ImageController } from "../controllers/image.controller";
import { upload } from "../config/cloudinary.config";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Upload multiple images
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  upload.array("files"),
  asyncHandler(ImageController.uploadImages),
);

// Delete image by URL
router.post(
  "/delete",
  authMiddleware,
  adminMiddleware,
  asyncHandler(ImageController.deleteImage),
);

export default router;
