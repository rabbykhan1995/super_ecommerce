import express from "express";
import { validate } from "../../middlewares/validation.middleware";
// import { createProductSchema } from "../validators/product.validator";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createPurchaseSchema,

} from "./purchase.validator";
import { PurchaseController } from "./purchase.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,
    validate(createPurchaseSchema),
    asyncHandler(PurchaseController.create),
  )
  // .put(
  //   "/update/:id",
  //   authMiddleware,
  //   validate(updateProductSchema),
  //   asyncHandler(ProductController.update),
  // )
  .get("/list", authMiddleware, asyncHandler(PurchaseController.list))
  .get("/purchaseInvoiceByID/:id", authMiddleware, asyncHandler(PurchaseController.purchaseInvoiceByID))
  .delete('/delete/:id', authMiddleware, asyncHandler(PurchaseController.delete))


export default router;