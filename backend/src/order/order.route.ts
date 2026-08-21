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
import { authorize } from "../../middlewares/rbac.middleware";

const router = express.Router();

router
    .post("/checkout", authMiddleware, validate(checkoutOrderSchema), asyncHandler(OrderController.checkout))
    .post("/checkout-mobile", authMiddleware, validate(checkoutOrderSchema), asyncHandler(OrderController.checkoutMobile))
    .post("/create", authMiddleware, authorize('order:create'), validate(createOrderSchema), asyncHandler(OrderController.createOrder))
    .get("/all-orders", authMiddleware, authorize("order-read"), asyncHandler(OrderController.allOrders))
    .get("/admin-order/:id", authMiddleware, authorize('order-read'), asyncHandler(OrderController.adminOrderDetail))
    .get("/my-orders", authMiddleware, asyncHandler(OrderController.myOrders))
    .get("/my-orders/:id", authMiddleware, asyncHandler(OrderController.myOrderDetail))
    .get("/track-order/:id", asyncHandler(OrderController.trackOrder))
    .post("/cancel/:id", authMiddleware, asyncHandler(OrderController.cancelOrder))
    .get("/order-success", authMiddleware, asyncHandler(OrderController.orderSuccess))
    .get("/order/:id", asyncHandler(OrderController.publicOrderTracking));

router.post("/stripe/webhook", asyncHandler(OrderController.stripeWebhook));

router
    .post("/update-status/:id", authMiddleware, authorize('order-update'), validate(updateOrderStatusSchema), asyncHandler(OrderController.adminUpdateOrderStatus))


export default router;
