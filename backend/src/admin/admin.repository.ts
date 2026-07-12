import { eq, and } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";
import {
  roles,
  permissions,
  rolePermissions,
  userRoles,
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

  static async createRolePermissions(
    data: { roleId: string; permissionId: string }[],
    client: QueryClient = db
  ) {
    return client.insert(rolePermissions).values(data);
  }

  static async findAllRoles(client: QueryClient = db) {
    return client.query.roles.findMany({
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    });
  }

  static async findRoleById(id: string, client: QueryClient = db) {
    return client.query.roles.findFirst({
      where: (r, { eq }) => eq(r.id, id),
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    });
  }

  static async findRoleBasicById(id: string, client: QueryClient = db) {
    return client.query.roles.findFirst({
      where: (r, { eq }) => eq(r.id, id),
    });
  }

  static async deleteRolePermissionsByRoleId(
    roleId: string,
    client: QueryClient = db
  ) {
    return client
      .delete(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));
  }

  static async deleteRole(id: string, client: QueryClient = db) {
    return client.delete(roles).where(eq(roles.id, id));
  }

  static async findUserById(id: string, client: QueryClient = db) {
    return client.query.userTable.findFirst({
      where: (u, { eq }) => eq(u.id, id),
    });
  }

  static async findUserRole(
    userId: string,
    roleId: string,
    client: QueryClient = db
  ) {
    return client
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userID, userId), eq(userRoles.roleId, roleId)))
      .limit(1);
  }

  static async hasUsersWithRoleId(roleId: string, client: QueryClient = db) {
    const result = await client
      .select()
      .from(userRoles)
      .where(eq(userRoles.roleId, roleId))
      .limit(1);
    return result.length > 0;
  }

  static async assignUserRole(
    data: { userID: string; roleId: string },
    client: QueryClient = db
  ) {
    return client.insert(userRoles).values(data).onConflictDoNothing();
  }

  static async removeUserRole(
    userId: string,
    roleId: string,
    client: QueryClient = db
  ) {
    return client
      .delete(userRoles)
      .where(and(eq(userRoles.userID, userId), eq(userRoles.roleId, roleId)));
  }

  static async findUserRolesByUserId(userId: string, client: QueryClient = db) {
    return client.query.userRoles.findMany({
      where: (ur, { eq }) => eq(ur.userID, userId),
      with: {
        role: {
          with: {
            rolePermissions: {
              with: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }
}
