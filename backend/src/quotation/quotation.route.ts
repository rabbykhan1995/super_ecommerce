import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  approveSaleQuotationSchema,
  createSaleQuotationSchema,

} from "./quotation.validator";
import QuotationController from "./quotation.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/create-sale-quotation",
    authMiddleware,
    validate(createSaleQuotationSchema),
    asyncHandler(QuotationController.createSaleQuotation),
  )
  .get('/list-sale-quotation', authMiddleware, asyncHandler(QuotationController.listOfSaleQuotation))

  .post(
    "/approve-sale-quotation/:id",
    authMiddleware,
    validate(approveSaleQuotationSchema),
    asyncHandler(QuotationController.approveSaleQuotation),
  )

  .get('/full-quotation/:id', authMiddleware, asyncHandler(QuotationController.getFullQuotation))
  .get('/sale-quotation-invoice/:id', authMiddleware, asyncHandler(QuotationController.getQuotationInvoice))
export default router