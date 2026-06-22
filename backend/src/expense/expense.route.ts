import express from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createExpenseSchema,
  createExpenseTypeSchema,
} from "./expense.validator";
import { ExpenseController } from "./expense.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/createExpense",
    authMiddleware,
    validate(createExpenseSchema),
    asyncHandler(ExpenseController.createExpense),
  )
  .get("/list", authMiddleware, asyncHandler(ExpenseController.list))
  .delete(
    "/delete/:id",
    authMiddleware,
    asyncHandler(ExpenseController.deleteExpense),
  )
  .post(
    "/create-expenseType",
    authMiddleware,

    validate(createExpenseTypeSchema),
    asyncHandler(ExpenseController.createExpenseType),
  )
  .put(
    "/update-expenseType/:id",
    authMiddleware,
    validate(createExpenseTypeSchema),
    asyncHandler(ExpenseController.updateExpenseType),
  )
  .delete(
    "/delete-expenseType/:id",
    authMiddleware,
    asyncHandler(ExpenseController.deleteExpenseType),
  )

  .get(
    "/all-expenseTypes",
    authMiddleware,
    asyncHandler(ExpenseController.allExpenseTypes),
  );

export default router;
