import express from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { PaymentController } from "./payment.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createPaymentSchema } from "./payment.validator";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  validate(createPaymentSchema),
  asyncHandler(PaymentController.create)
);

router.get(
  "/list",
  authMiddleware,
  asyncHandler(PaymentController.list)
);

router.get(
  "/:id",
  authMiddleware,
  asyncHandler(PaymentController.findByID)
);

export default router;
