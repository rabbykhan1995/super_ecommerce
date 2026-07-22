import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import {
    createBannerSchema, updateBannerSchema,
    createFlashSaleSchema, updateFlashSaleSchema, createFlashSaleProductSchema,
    createFeaturedProductSchema,
    createEcomOrderSchema,
    updateOrderStatusSchema,
} from "./ecom.validator";
import { BannerController, FlashSaleController, FeaturedProductController, EcomProductListController, EcomOrderController } from "./ecom.controller";

const router = express.Router();

// ─── Banner ──────────────────────────────────────────────────────────────────

router
    .post("/banner/create", authMiddleware, validate(createBannerSchema), asyncHandler(BannerController.create))
    .put("/banner/update/:id", authMiddleware, validate(updateBannerSchema), asyncHandler(BannerController.update))
    .delete("/banner/delete/:id", authMiddleware, asyncHandler(BannerController.delete))
    .get("/banner/list", authMiddleware, asyncHandler(BannerController.list))
    .get("/banner/active", asyncHandler(BannerController.activeBanners));

// ─── Flash Sale ──────────────────────────────────────────────────────────────

router
    .post("/flash-sale/create", authMiddleware, validate(createFlashSaleSchema), asyncHandler(FlashSaleController.createSale))
    .put("/flash-sale/update/:id", authMiddleware, validate(updateFlashSaleSchema), asyncHandler(FlashSaleController.updateSale))
    .delete("/flash-sale/delete/:id", authMiddleware, asyncHandler(FlashSaleController.deleteSale))
    .get("/flash-sale/list", authMiddleware, asyncHandler(FlashSaleController.listSales))
    .get("/flash-sale/active", asyncHandler(FlashSaleController.activeSale))
    .post("/flash-sale/add-product", authMiddleware, validate(createFlashSaleProductSchema), asyncHandler(FlashSaleController.addProduct))
    .delete("/flash-sale/remove-product/:id", authMiddleware, asyncHandler(FlashSaleController.removeProduct))
    .get("/flash-sale/products/:id", authMiddleware, asyncHandler(FlashSaleController.productsBySaleID));

// ─── Featured Product ────────────────────────────────────────────────────────

router
    .post("/featured-product/add", authMiddleware, validate(createFeaturedProductSchema), asyncHandler(FeaturedProductController.add))
    .delete("/featured-product/remove/:id", authMiddleware, asyncHandler(FeaturedProductController.remove))
    .get("/featured-product/toggle/:productID", authMiddleware, asyncHandler(FeaturedProductController.toggle))
    .get("/featured-product/list", authMiddleware, asyncHandler(FeaturedProductController.list))
    .get("/featured-product/active", asyncHandler(FeaturedProductController.activeFeatured));

// ─── Ecom Product List (public) ──────────────────────────────────────────────

router
    .get("/featured", asyncHandler(EcomProductListController.featured))
    .get("/flash-products", asyncHandler(EcomProductListController.flash))
    .get("/offers", asyncHandler(EcomProductListController.offers));

// ─── Ecom Orders ─────────────────────────────────────────────────────────────

router
    .post("/checkout", authMiddleware, validate(createEcomOrderSchema), asyncHandler(EcomOrderController.checkout))
    .get("/my-orders", authMiddleware, asyncHandler(EcomOrderController.myOrders))
    .get("/my-orders/:orderNo", authMiddleware, asyncHandler(EcomOrderController.myOrderDetail))
    .post("/cancel/:orderNo", authMiddleware, asyncHandler(EcomOrderController.cancelOrder))
    .get("/order-success", authMiddleware, asyncHandler(EcomOrderController.orderSuccess))
    .get("/order/:orderNo", asyncHandler(EcomOrderController.publicOrderTracking));

// ─── Stripe Webhook (no auth -- raw body) ────────────────────────────────────

router.post("/stripe/webhook", asyncHandler(EcomOrderController.stripeWebhook));

// ─── Admin Order Management ──────────────────────────────────────────────────

router
    .patch("/admin/order/:orderNo/status", authMiddleware, adminMiddleware, validate(updateOrderStatusSchema), asyncHandler(EcomOrderController.adminUpdateOrderStatus))
    .post("/admin/order/:orderNo/confirm-sale", authMiddleware, adminMiddleware, asyncHandler(EcomOrderController.adminConfirmSale))
    .delete("/admin/order/:orderNo", authMiddleware, adminMiddleware, asyncHandler(EcomOrderController.adminDeleteOrder));

export default router;
