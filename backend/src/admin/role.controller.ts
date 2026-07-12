import { Request, Response } from "express";
import { AdminService } from "./admin.service";

export class AdminController {
  static async listPermissions(req: Request, res: Response) {
    const allPermissions = await AdminService.listPermissions();
    res.status(200).json({ success: true, data: allPermissions });
  }

  static async createRole(req: Request, res: Response) {
    const role = await AdminService.createRole(req.body);
    res.status(201).json({
      success: true,
      data: role,
      msg: "Role created successfully",
    });
  }

  static async listRoles(req: Request, res: Response) {
    const allRoles = await AdminService.listRoles();
    res.status(200).json({ success: true, data: allRoles });
  }

  static async getRoleById(req: Request, res: Response) {
    const { id } = req.params;
    const role = await AdminService.getRoleById(id as string);
    res.status(200).json({ success: true, data: role });
  }

  static async updateRolePermissions(req: Request, res: Response) {
    const { id } = req.params;
    await AdminService.updateRolePermissions(id as string, req.body);
    res.status(200).json({
      success: true,
      msg: "Role permissions updated successfully",
    });
  }

  static async deleteRole(req: Request, res: Response) {
    const { id } = req.params;
    await AdminService.deleteRole(id as string);
    res.status(200).json({
      success: true,
      msg: "Role deleted successfully",
    });
  }

  static async assignUserRole(req: Request, res: Response) {
    await AdminService.assignUserRole(req.body);
    res.status(201).json({
      success: true,
      msg: "Role assigned to user successfully",
    });
  }

  static async removeUserRole(req: Request, res: Response) {
    await AdminService.removeUserRole(req.body);
    res.status(200).json({
      success: true,
      msg: "Role removed from user successfully",
    });
  }

  static async getUserRoles(req: Request, res: Response) {
    const { userId } = req.params;
    const userRolesData = await AdminService.getUserRoles(userId as string);
    res.status(200).json({ success: true, data: userRolesData });
  }
}
