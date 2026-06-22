import express from "express";
import { validate } from "../../middlewares/validation.middleware";
// import { createProductSchema } from "../validators/product.validator";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createSaleSchema,
createFifoSaleSchema
} from "./sale.validator";
import { SaleController } from "./sale.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,
    validate(createSaleSchema),
    asyncHandler(SaleController.create),
  )
    .post(
    "/create-fifo-sale",
    authMiddleware,
    validate(createFifoSaleSchema),
    asyncHandler(SaleController.fifoSale),
  )
  // .put(
  //   "/update/:id",
  //   authMiddleware,
  //   validate(updateProductSchema),
  //   asyncHandler(ProductController.update),
  // )
  .get("/list", authMiddleware, asyncHandler(SaleController.list))
  .get("/saleByID/:id", authMiddleware, asyncHandler(SaleController.saleByID))
  .delete('/delete/:id', authMiddleware, asyncHandler(SaleController.delete))

export default router;