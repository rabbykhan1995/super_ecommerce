import express from "express";

import { asyncHandler } from "../../utils/asyncHandler";

LedgerController
import { authMiddleware } from "../../middlewares/auth.middleware";
import { LedgerController } from "./ledger.controller";
import { authorize } from "../../middlewares/rbac.middleware";

const router = express.Router();

router
  .get(
    "/list",
    authorize('ledger:read'),
    authMiddleware,
    asyncHandler(LedgerController.list),
  )



export default router;