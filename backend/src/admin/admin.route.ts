import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/rbac.middleware";
import { AdminController } from "./admin.controller";
import {
  createRoleSchema,
  assignUserRoleSchema,
  removeUserRoleSchema,
  assignPermissionToRoleSchema,
  removePermissionFromRoleSchema,
  updateRoleSchema,
} from "./admin.validator";
import { createStaffProfileSchema, updateStaffProfileSchema } from "../auth/auth.validator";

const router = Router();

// Permissions
router.get(
  "/permissions",
  authMiddleware,
  asyncHandler(AdminController.listPermissions)
);

// Roles CRUD
router.post(
  "/create-role",
  authMiddleware,
  authorize("role:create"),
  validate(createRoleSchema),
  asyncHandler(AdminController.createRole)
);

// Roles CRUD
router.post(
  "/update-role/:roleID",
  authMiddleware,
  authorize("role:update"),
  validate(updateRoleSchema),
  asyncHandler(AdminController.updateRole)
);

router.post(
  "/assign-role-permissions",
  authMiddleware,
  authorize("role:update"),
  validate(assignPermissionToRoleSchema),
  asyncHandler(AdminController.assignRolePermission)
);

router.get(
  "/role-list",
  authMiddleware,
  authorize("role:read"),
  asyncHandler(AdminController.listRoles)
);

router.get(
  "/role-permissions/:roleID",
  authMiddleware,
  authorize("role:read"),
  asyncHandler(AdminController.getRoleById)
);


router.delete(
  "/role-delete/:id",
  authMiddleware,
  authorize("role:delete"),
  asyncHandler(AdminController.deleteRole)
);

// User-Role Assignment
router.post(
  "/role/assign-user",
  authMiddleware,
  authorize("role:assign"),
  validate(assignUserRoleSchema),
  asyncHandler(AdminController.assignUserRole)
);

router.post(
  "/role/remove-user",
  authMiddleware,
  authorize("role:assign"),
  validate(removeUserRoleSchema),
  asyncHandler(AdminController.removeUserRole)
);

router.get(
  "/user/:userID/role",
  authMiddleware,
  authorize("role:read"),
  asyncHandler(AdminController.getUserRole)
);

router.get(
  "/get-all-staff",
  authMiddleware,
  authorize(""),
  asyncHandler(AdminController.getAllStaff)
);

router.post(
  "/create-staff",
  authMiddleware,
  authorize(""),
  validate(createStaffProfileSchema),
  asyncHandler(AdminController.createStaff)
);

router.post(
  "/update-staff/:staffID",
  authMiddleware,
  authorize(""),
  validate(updateStaffProfileSchema),
  asyncHandler(AdminController.updateStaff)
);

export default router;
