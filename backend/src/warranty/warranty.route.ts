import express from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import WarrantyController from "./warranty.controller";
import { validate } from "../../middlewares/validation.middleware";
import { updateWarrantySchema } from "./warranty.validator";

const router = express.Router();

router

  .get("/list", authMiddleware, asyncHandler(WarrantyController.list))
  .post("/claim/:id", authMiddleware, validate(updateWarrantySchema), asyncHandler(WarrantyController.claim))
  .post("/send-to-supplier/:id", authMiddleware, validate(updateWarrantySchema), asyncHandler(WarrantyController.sendToSupplier))
  .post("/supplier-action-update/:id", authMiddleware, validate(updateWarrantySchema), asyncHandler(WarrantyController.supplierActionUpdate))
  .post("/recieve-from-supplier/:id", authMiddleware, validate(updateWarrantySchema), asyncHandler(WarrantyController.recieveFromSupplier))
  .post("/return-to-customer/:id", authMiddleware, validate(updateWarrantySchema), asyncHandler(WarrantyController.returnToCustomer))

export default router;