import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validator";
import { CategoryController } from "./category.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,
    validate(createCategorySchema),
    asyncHandler(CategoryController.create),
  )
  .put(
    "/update/:id",
    authMiddleware,
    validate(updateCategorySchema),
    asyncHandler(CategoryController.update),
  )
  .get("/list", asyncHandler(CategoryController.list))
  .delete('/delete/:id', authMiddleware,
    asyncHandler(CategoryController.delete))

export default router;
