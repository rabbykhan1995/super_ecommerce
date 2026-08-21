import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { AuthService } from "../auth/auth.service";

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
  static async updateRole(req: Request, res: Response) {
    const { roleID } = req.params;
    const role = await AdminService.updateRole(roleID.toString(), req.body);
    res.status(201).json({
      success: true,
      data: role,
      msg: "Role updated successfully",
    });
  }

  static async assignRolePermission(req: Request, res: Response) {
    await AdminService.assignPermissionToRole(req.body);
    res.status(201).json({
      success: true,
      msg: "Assigned Role Permission successfully",
    });
  }


  static async listRoles(req: Request, res: Response) {
    const allRoles = await AdminService.listRoles();
    res.status(200).json({ success: true, data: allRoles });
  }

  static async getRoleById(req: Request, res: Response) {
    const { roleID } = req.params;
    const role = await AdminService.getRoleById(roleID as string);
    res.status(200).json({ success: true, data: role });
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

  static async getUserRole(req: Request, res: Response) {
    const { userID } = req.params;
    const userRoleData = await AdminService.getUserRole(userID as string);
    res.status(200).json({ success: true, data: userRoleData });
  }
  static async getAllStaff(req: Request, res: Response) {

    const data = await AdminService.getAllStaff();
    res.status(200).json({ success: true, data: data });
  }

  static async createStaff(req: Request, res: Response) {

    const data = await AuthService.createStaff(req.body);
    res.status(201).json({ success: true, data: data, msg: "Staff created successfully" });
  }

  static async updateStaff(req: Request, res: Response) {
    const { staffID } = req.params;
    const data = await AuthService.updateStaff(staffID.toString(), req.body);
    res.status(201).json({ success: true, data: data, msg: "Staff updated successfully" });
  }
}
