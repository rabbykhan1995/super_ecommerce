import express from "express";
import { validate } from "../../middlewares/validation.middleware";
// import { createProductSchema } from "../validators/product.validator";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createBrandSchema,
  updateBrandSchema,
} from "./brand.validator";
import { BrandController } from "./brand.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,
    validate(createBrandSchema),
    asyncHandler(BrandController.create),
  )
  .put(
    "/update/:id",
    authMiddleware,
    validate(updateBrandSchema),
    asyncHandler(BrandController.update),
  )
  .delete(
    "/delete/:id",
    authMiddleware,
    asyncHandler(BrandController.delete),
  )
  .get("/list", asyncHandler(BrandController.list))

export default router;
