import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createParcelSchema,
  updateParcelStatusSchema,
  updateParcelSchema,
} from "./parcel.validator";
import { ParcelController } from "./parcel.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,
    validate(createParcelSchema),
    asyncHandler(ParcelController.create)
  )
  .get("/list", authMiddleware, asyncHandler(ParcelController.list))
  .get("/parcelByID/:id", authMiddleware, asyncHandler(ParcelController.getByID))
  .put(
    "/update-status/:id",
    authMiddleware,
    validate(updateParcelStatusSchema),
    asyncHandler(ParcelController.updateStatus)
  )
  .put(
    "/update/:id",
    authMiddleware,
    validate(updateParcelSchema),
    asyncHandler(ParcelController.update)
  )
  .delete("/delete/:id", authMiddleware, asyncHandler(ParcelController.delete))
  .get(
    "/customer-address/:customerID",
    authMiddleware,
    asyncHandler(ParcelController.getCustomerAddress)
  );

export default router;
