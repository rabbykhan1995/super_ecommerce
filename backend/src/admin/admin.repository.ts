import { eq, and, or } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";
import {
  roles,
  permissions,
  rolePermissions,
  userRole,
  userTable,
} from "../auth/auth.table";

export class AdminRepository {
  static async findAllPermissions(client: QueryClient = db) {
    return client.select().from(permissions);
  }

  static async findRoleByName(name: string, client: QueryClient = db) {
    return client
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);
  }

  static async createRole(
    data: { name: string; description: string; isSuperAdmin: boolean },
    client: QueryClient = db
  ) {
    const [role] = await client.insert(roles).values(data).returning();
    return role;
  }
  static async updateRole(
    roleID: string,
    data: { name?: string; description?: string },
    client: QueryClient = db
  ) {
    const [role] = await client
      .update(roles)
      .set(data)
      .where(eq(roles.id, roleID))
      .returning();

    return role;
  }

  static async assignRolePermissions(
    data: { roleID: string; permissionID: string }[],
    client: QueryClient = db
  ) {
    return client.insert(rolePermissions).values(data);
  }

  static async findAllRoles(client: QueryClient = db) {
    return client.query.roles.findMany();
  }

  static async findRoleById(roleID: string, client: QueryClient = db) {
    return client.query.rolePermissions.findMany({
      where: (r, { eq }) => eq(r.roleID, roleID),
    });
  }

  static async findRoleBasicById(id: string, client: QueryClient = db) {
    return client.query.roles.findFirst({
      where: (r, { eq }) => eq(r.id, id),
    });
  }

  static async deleteRolePermissionsByRoleId(
    roleID: string,
    client: QueryClient = db
  ) {
    return client
      .delete(rolePermissions)
      .where(eq(rolePermissions.roleID, roleID));
  }

  static async removeRolePermissions(
    rolePermissionValues: {
      roleID: string;
      permissionID: string;
    }[],
    client: QueryClient = db
  ) {
    return client
      .delete(rolePermissions)
      .where(
        or(
          ...rolePermissionValues.map(({ roleID, permissionID }) =>
            and(
              eq(rolePermissions.roleID, roleID),
              eq(rolePermissions.permissionID, permissionID)
            )
          )
        )
      );
  }

  static async deleteRole(id: string, client: QueryClient = db) {
    return client.delete(roles).where(eq(roles.id, id));
  }



  static async findUserRole(
    userID: string,
    roleID: string,
    client: QueryClient = db
  ) {
    return client
      .select()
      .from(userRole)
      .where(and(eq(userRole.userID, userID), eq(userRole.roleID, roleID)))
      .limit(1);
  }

  static async hasUsersWithRoleId(roleID: string, client: QueryClient = db) {
    const result = await client
      .select()
      .from(userRole)
      .where(eq(userRole.roleID, roleID))
      .limit(1);
    return result.length > 0;
  }

  static async assignUserRole(
    data: { userID: string; roleID: string },
    client: QueryClient = db
  ) {
    return client.insert(userRole).values(data).onConflictDoNothing();
  }

  static async removeUserRole(
    userID: string,
    roleID: string,
    client: QueryClient = db
  ) {
    return client
      .delete(userRole)
      .where(and(eq(userRole.userID, userID), eq(userRole.roleID, roleID)));
  }

  static async removeAllUserRoles(userID: string, client: QueryClient = db) {
    return client.delete(userRole).where(eq(userRole.userID, userID));
  }

  static async findUserRoleByUserId(userId: string, client: QueryClient = db) {
    return client.query.userRole.findFirst({
      where: (ur, { eq }) => eq(ur.userID, userId),
      with: {
        role: true
      },
    });
  }
}
