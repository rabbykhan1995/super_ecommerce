import express from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import { TransactionController } from "./transaction.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createTransactionSchema } from "./transaction.validator";

const router = express.Router();

router
    .post("/create", authMiddleware, validate(createTransactionSchema), asyncHandler(TransactionController.createTransaction))
    .get("/account-list", authMiddleware, asyncHandler(TransactionController.accountTransactionList))
    .get('/detailsbyID/:id', authMiddleware, asyncHandler(TransactionController.transactionDetails));
   
export default router;
