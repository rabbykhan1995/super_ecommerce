import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createFeaturedProductSchema } from "./ecom.validator";
import { FeaturedProductController } from "./featured_product.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
    .post("/add", authMiddleware, validate(createFeaturedProductSchema), asyncHandler(FeaturedProductController.add))
    .delete("/remove/:id", authMiddleware, asyncHandler(FeaturedProductController.remove))
    .get("/list", authMiddleware, asyncHandler(FeaturedProductController.list))
    .get("/active", asyncHandler(FeaturedProductController.activeFeatured));

export default router;
