import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createProductSchema,
  updateProductSchema,
} from "./product.validator";
import { ProductController } from "./product.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,
    validate(createProductSchema),
    asyncHandler(ProductController.create),
  )
  .put(
    "/update/:id",
    authMiddleware,
    validate(updateProductSchema),
    asyncHandler(ProductController.update),
  )
  .get("/list", authMiddleware, asyncHandler(ProductController.list))
    .get("/variant-list", authMiddleware, asyncHandler(ProductController.variantList))
  .get("/productByID/:id", authMiddleware, asyncHandler(ProductController.productByID))
  .get("/productBySlug/:slug", asyncHandler(ProductController.productBySlug))
  .get("/productByBarcode", authMiddleware, asyncHandler(ProductController.productByBarcode))
  .get("/batchByVariant/:id", authMiddleware, asyncHandler(ProductController.batchByVariant))
  .get("/batchBySerial", authMiddleware, asyncHandler(ProductController.findBatchBySerial))
  .get("/serialByProduct/:id", authMiddleware, asyncHandler(ProductController.serialByProduct))
  .get("/getSaleProduct/:productID/:variantID", authMiddleware, asyncHandler(ProductController.getSaleProduct))
  .get("/getPosProducts", authMiddleware, asyncHandler(ProductController.getPosProducts))
  .get("/updatePosProduct/:id", authMiddleware, asyncHandler(ProductController.updatePosProduct))
  .get("/ecom-product-list", asyncHandler(ProductController.ecomProductList))

export default router;