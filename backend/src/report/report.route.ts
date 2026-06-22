import express from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ReportController } from "./report.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
    .get(
        "/dashboard",
        authMiddleware,
        asyncHandler(ReportController.dashboardReport),
    )
    

export default router;
