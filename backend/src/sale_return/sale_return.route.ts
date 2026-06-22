import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createSaleReturnSchema,
} from "./sale_return.validator";
import { SaleReturnController } from "./sale_return.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,
    validate(createSaleReturnSchema),
    asyncHandler(SaleReturnController.create),
  )
  .get("/list", authMiddleware, asyncHandler(SaleReturnController.list))
  .get("/saleByID/:id", authMiddleware, asyncHandler(SaleReturnController.saleReturnByID))
  .delete('/delete/:id', authMiddleware, asyncHandler(SaleReturnController.delete))
  .get("/product-by-id/:saleID", authMiddleware, asyncHandler(SaleReturnController.getSaleReturnBatches))

export default router;