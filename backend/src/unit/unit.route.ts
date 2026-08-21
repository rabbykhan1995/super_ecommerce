import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createUnitSchema,
  updateUnitSchema,
} from "./unit.validator";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { UnitController } from "./unit.controller";
import { authorize } from "../../middlewares/rbac.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,authorize('unit:create'),
    validate(createUnitSchema),
    asyncHandler(UnitController.create),
  )
  .put(
    "/update/:id",
    authMiddleware,authorize('unit:update'),
    validate(updateUnitSchema),
    asyncHandler(UnitController.update),
  )
  .delete(
    "/delete/:id",
    authMiddleware,authorize('unit:delete'),
    asyncHandler(UnitController.delete),
  )
  .get("/list", asyncHandler(UnitController.list))

export default router;
