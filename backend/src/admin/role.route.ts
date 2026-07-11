import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { AdminController } from "./role.controller";
import {
  createRoleSchema,
  updateRolePermissionsSchema,
  assignUserRoleSchema,
  removeUserRoleSchema,
} from "./admin.validator";

const router = Router();

// Permissions
router.get(
  "/permissions",
  authMiddleware,
  authorize("role:read"),
  asyncHandler(AdminController.listPermissions)
);

// Roles CRUD
router.post(
  "/create",
  authMiddleware,
  authorize("role:create"),
  validate(createRoleSchema),
  asyncHandler(AdminController.createRole)
);

router.get(
  "/list",
  authMiddleware,
  authorize("role:read"),
  asyncHandler(AdminController.listRoles)
);

router.get(
  "/:id",
  authMiddleware,
  authorize("role:read"),
  asyncHandler(AdminController.getRoleById)
);

router.put(
  "/:id/permissions",
  authMiddleware,
  authorize("role:update"),
  validate(updateRolePermissionsSchema),
  asyncHandler(AdminController.updateRolePermissions)
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("role:delete"),
  asyncHandler(AdminController.deleteRole)
);

// User-Role Assignment
router.post(
  "/assign-user",
  authMiddleware,
  authorize("role:assign"),
  validate(assignUserRoleSchema),
  asyncHandler(AdminController.assignUserRole)
);

router.post(
  "/remove-user",
  authMiddleware,
  authorize("role:assign"),
  validate(removeUserRoleSchema),
  asyncHandler(AdminController.removeUserRole)
);

router.get(
  "/user/:userId/roles",
  authMiddleware,
  authorize("role:read"),
  asyncHandler(AdminController.getUserRoles)
);

export default router;
