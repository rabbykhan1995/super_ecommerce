import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import {
    checkoutOrderSchema,
    createOrderSchema,
    updateOrderStatusSchema,
} from "./order.validator";
import { OrderController } from "./order.controller";

const router = express.Router();

router
    .post("/checkout", authMiddleware, validate(checkoutOrderSchema), asyncHandler(OrderController.checkout))
    .post("/checkout-mobile", authMiddleware, validate(checkoutOrderSchema), asyncHandler(OrderController.checkoutMobile))
    .post("/create", authMiddleware, adminMiddleware, validate(createOrderSchema), asyncHandler(OrderController.createOrder))
    .get("/all-orders", authMiddleware, adminMiddleware, asyncHandler(OrderController.allOrders))
    .get("/admin-order/:id", authMiddleware, adminMiddleware, asyncHandler(OrderController.adminOrderDetail))
    .get("/my-orders", authMiddleware, asyncHandler(OrderController.myOrders))
    .get("/my-orders/:id", authMiddleware, asyncHandler(OrderController.myOrderDetail))
    .post("/cancel/:id", authMiddleware, asyncHandler(OrderController.cancelOrder))
    .get("/order-success", authMiddleware, asyncHandler(OrderController.orderSuccess))
    .get("/order/:id", asyncHandler(OrderController.publicOrderTracking));

router.post("/stripe/webhook", asyncHandler(OrderController.stripeWebhook));

router
    .post("/update-status/:id", authMiddleware, adminMiddleware, validate(updateOrderStatusSchema), asyncHandler(OrderController.adminUpdateOrderStatus))


export default router;
