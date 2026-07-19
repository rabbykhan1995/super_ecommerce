import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
    createBannerSchema, updateBannerSchema,
    createFlashSaleSchema, updateFlashSaleSchema, createFlashSaleProductSchema,
    createFeaturedProductSchema,
} from "./ecom.validator";
import { BannerController, FlashSaleController, FeaturedProductController, EcomProductListController } from "./ecom.controller";

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

export default router;
