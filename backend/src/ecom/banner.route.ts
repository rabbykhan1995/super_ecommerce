import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createBannerSchema, updateBannerSchema } from "./ecom.validator";
import { BannerController } from "./banner.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
    .post("/create", authMiddleware, validate(createBannerSchema), asyncHandler(BannerController.create))
    .put("/update/:id", authMiddleware, validate(updateBannerSchema), asyncHandler(BannerController.update))
    .delete("/delete/:id", authMiddleware, asyncHandler(BannerController.delete))
    .get("/list", authMiddleware, asyncHandler(BannerController.list))
    .get("/active", asyncHandler(BannerController.activeBanners));

export default router;
