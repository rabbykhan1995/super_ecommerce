import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validator";
import { CategoryController } from "./category.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,
    authorize('category:create'),
    validate(createCategorySchema),
    asyncHandler(CategoryController.create),
  )
  .put(
    "/update/:id",
    authMiddleware,
    authorize('category:update'),
    validate(updateCategorySchema),
    asyncHandler(CategoryController.update),
  )
  .get("/list", asyncHandler(CategoryController.list))
  .delete('/delete/:id', authMiddleware, authorize('category:delete'),
    asyncHandler(CategoryController.delete))

export default router;
