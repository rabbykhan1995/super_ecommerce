import express from "express";
import { validate } from "../../middlewares/validation.middleware";
// import { createProductSchema } from "../validators/product.validator";
import { asyncHandler } from "../../utils/asyncHandler";
import {
    balanceTransferSchema,
    createAccountSchema,
    updateAccountSchema,
} from "./account.validator";
import { AccountController } from "./account.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createTransactionSchema } from "../transaction/transaction.validator";

const router = express.Router();

router
    .post(
        "/create",
        authMiddleware,
        validate(createAccountSchema),
        asyncHandler(AccountController.create),
    )
    .put(
        "/update/:id",
        authMiddleware,
        validate(updateAccountSchema),
        asyncHandler(AccountController.update),
    )
    // .delete(
    //     "/delete/:id",
    //     authMiddleware,
    //     asyncHandler(AccountController.delete),
    // )
    .get("/list", authMiddleware, asyncHandler(AccountController.list))
    .post("/balance-transfer", authMiddleware, validate(balanceTransferSchema), asyncHandler(AccountController.balanceTransfer))
    .get("/details/:id", authMiddleware, asyncHandler(AccountController.accountDetailsByID))
export default router;
