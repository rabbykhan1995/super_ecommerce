import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "./cart.validator";
import { CartController } from "./cart.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/add",
    authMiddleware,
    validate(addToCartSchema),
    asyncHandler(CartController.addToCart),
  )
  .get("/list", authMiddleware, asyncHandler(CartController.getCart))
  .put(
    "/update/:id",
    authMiddleware,
    validate(updateCartItemSchema),
    asyncHandler(CartController.updateQuantity),
  )
  .delete(
    "/remove/:id",
    authMiddleware,
    asyncHandler(CartController.removeItem),
  )
  .delete(
    "/clear",
    authMiddleware,
    asyncHandler(CartController.clearCart),
  );

export default router;
