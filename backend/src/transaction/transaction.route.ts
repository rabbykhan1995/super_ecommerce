import express from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { TransactionController } from "./transaction.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
    .get("/account-transaction-list", authMiddleware, asyncHandler(TransactionController.accountTransactionList))

   
export default router;
