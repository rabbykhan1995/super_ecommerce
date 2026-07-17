import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createFlashSaleSchema, updateFlashSaleSchema, createFlashSaleProductSchema } from "./ecom.validator";
import { FlashSaleController } from "./flash_sale.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
    .post("/create", authMiddleware, validate(createFlashSaleSchema), asyncHandler(FlashSaleController.createSale))
    .put("/update/:id", authMiddleware, validate(updateFlashSaleSchema), asyncHandler(FlashSaleController.updateSale))
    .delete("/delete/:id", authMiddleware, asyncHandler(FlashSaleController.deleteSale))
    .get("/list", authMiddleware, asyncHandler(FlashSaleController.listSales))
    .get("/active", asyncHandler(FlashSaleController.activeSale))
    .post("/add-product", authMiddleware, validate(createFlashSaleProductSchema), asyncHandler(FlashSaleController.addProduct))
    .delete("/remove-product/:id", authMiddleware, asyncHandler(FlashSaleController.removeProduct))
    .get("/products/:id", authMiddleware, asyncHandler(FlashSaleController.productsBySaleID));

export default router;
