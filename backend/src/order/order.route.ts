import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import {
    createOrderSchema,
    updateOrderStatusSchema,
} from "./order.validator";
import { OrderController } from "./order.controller";

const router = express.Router();

// ─── Orders ────────────────────────────────────────────────────────────────

router
    .post("/checkout", authMiddleware, validate(createOrderSchema), asyncHandler(OrderController.checkout))
    .get("/all-orders",authMiddleware, adminMiddleware, asyncHandler(OrderController.allOrders))
    .get("/my-orders", authMiddleware, asyncHandler(OrderController.myOrders))
    .get("/my-orders/:orderNo", authMiddleware, asyncHandler(OrderController.myOrderDetail))
    .post("/cancel/:orderNo", authMiddleware, asyncHandler(OrderController.cancelOrder))
    .get("/order-success", authMiddleware, asyncHandler(OrderController.orderSuccess))
    .get("/order/:orderNo", asyncHandler(OrderController.publicOrderTracking));

// ─── Stripe Webhook (no auth -- raw body) ──────────────────────────────────

router.post("/stripe/webhook", asyncHandler(OrderController.stripeWebhook));

// ─── Admin Order Management ────────────────────────────────────────────────

router
    .patch("/admin/order/:orderNo/status", authMiddleware, adminMiddleware, validate(updateOrderStatusSchema), asyncHandler(OrderController.adminUpdateOrderStatus))
    .post("/admin/order/:orderNo/confirm-sale", authMiddleware, adminMiddleware, asyncHandler(OrderController.adminConfirmSale))
    .delete("/admin/order/:orderNo", authMiddleware, adminMiddleware, asyncHandler(OrderController.adminDeleteOrder));

export default router;
