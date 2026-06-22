import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createUnitSchema,
  updateUnitSchema,
} from "./unit.validator";
import { UnitController } from "./unit.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,
    validate(createUnitSchema),
    asyncHandler(UnitController.create),
  )
  .put(
    "/update/:id",
    authMiddleware,
    validate(updateUnitSchema),
    asyncHandler(UnitController.update),
  )
  .delete(
    "/delete/:id",
    authMiddleware,

    asyncHandler(UnitController.delete),
  )
  .get("/list", asyncHandler(UnitController.list))

export default router;
