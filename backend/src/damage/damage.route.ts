import express from "express";
import { validate } from "../../middlewares/validation.middleware";
// import { createProductSchema } from "../validators/product.validator";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createDamageSchema,

} from "./damage.validator";
import { DamageController } from "./damage.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router
  .post(
    "/create",
    authMiddleware,
    validate(createDamageSchema),
    asyncHandler(DamageController.create),
  )
  // .put(
  //   "/update/:id",
  //   authMiddleware,
  //   validate(updateProductSchema),
  //   asyncHandler(ProductController.update),
  // )
  .get("/list", authMiddleware, asyncHandler(DamageController.list))
  .delete('/delete/:id', authMiddleware, asyncHandler(DamageController.delete))

export default router;