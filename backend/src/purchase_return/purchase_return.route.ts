import express from "express";
import { validate } from "../../middlewares/validation.middleware";
// import { createProductSchema } from "../validators/product.validator";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createPurchaseReturnSchema,
} from "./purchase_return.validator";
import { PurchaseReturnController } from "./purchase_return.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,
    validate(createPurchaseReturnSchema),
    asyncHandler(PurchaseReturnController.create),
  )
  .get("/list", authMiddleware, asyncHandler(PurchaseReturnController.list))
  .get("/purchaseByID/:id", authMiddleware, asyncHandler(PurchaseReturnController.purchaseReturnByID))
  .delete('/delete/:id', authMiddleware, asyncHandler(PurchaseReturnController.delete))
    .get("/product-by-id/:purchaseID", authMiddleware, asyncHandler(PurchaseReturnController.getPurchaseReturnBatches))

export default router;