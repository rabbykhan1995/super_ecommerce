import { eq } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";
import { CreateStaffInput, UpdateStaffInput, UpdateUserInput, UserPayload } from "./auth.type";
import {
  userTable,
  userRoles,
  roles,
  rolePermissions,
  permissions,
  staffProfiles,
} from "./auth.table";
import { paginateQuery } from "../../utils/queryBuilder";

export class AuthRepository {
  static async createUser(payload: UserPayload, client: QueryClient = db) {
    const [user] = await client.insert(userTable).values(payload).returning();
    return user ?? null;
  }

  static async updateUser(
    userID: string,
    payload: UpdateUserInput,
    client: QueryClient = db,
  ) {

    const [user] = await client
      .update(userTable)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userID))
      .returning();

    return user ?? null;
  }

  static async findByID(
    userID: string,
    client: QueryClient = db,
  ) {
    return client.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.id, userID),
      with: { contact: true }
    });
  }



  static async findByEmail(email: string, client: QueryClient = db) {
    return client.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
  }

  static async findByMobile(mobile: string, client: QueryClient = db) {
    return client.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.mobile, mobile),
    });
  }

  static async findUserWithRolesByEmail(email: string, client: QueryClient = db) {
    const user = await client.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!user) return null;

    const userRoleRows = await client
      .select({
        roleId: roles.id,
        roleName: roles.name,
        isSuperAdmin: roles.isSuperAdmin,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleID, roles.id))
      .where(eq(userRoles.userID, user.id));

    if (userRoleRows.length === 0) return { ...user, roles: [], permissions: [], isSuperAdmin: false };

    const roleIds = userRoleRows.map((r) => r.roleId);

    const permissionRows = await client
      .select({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionID, permissions.id))
      .where(eq(rolePermissions.roleID, roleIds[0]));

    let allPermissions: string[] = [];

    if (roleIds.length > 1) {
      const morePerms = await client
        .select({ name: permissions.name })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionID, permissions.id))
        .where(eq(rolePermissions.roleID, roleIds[1]));
      allPermissions = [...permissionRows.map((p) => p.name), ...morePerms.map((p) => p.name)];
    } else {
      allPermissions = permissionRows.map((p) => p.name);
    }

    const uniquePermissions = [...new Set(allPermissions)];

    const isSuperAdmin = userRoleRows.some((r) => r.isSuperAdmin);

    return {
      ...user,
      roles: userRoleRows.map((r) => ({ id: r.roleId, name: r.roleName, isSuperAdmin: r.isSuperAdmin })),
      permissions: uniquePermissions,
      isSuperAdmin,
    };
  }

  static async findUserWithRolesByMobile(mobile: string, client: QueryClient = db) {
    const user = await client.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.mobile, mobile),
    });

    if (!user) return null;

    const userRoleRows = await client
      .select({
        roleId: roles.id,
        roleName: roles.name,
        isSuperAdmin: roles.isSuperAdmin,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleID, roles.id))
      .where(eq(userRoles.userID, user.id));

    if (userRoleRows.length === 0) return { ...user, roles: [], permissions: [], isSuperAdmin: false };

    const roleIds = userRoleRows.map((r) => r.roleId);

    const permissionRows = await client
      .select({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionID, permissions.id))
      .where(eq(rolePermissions.roleID, roleIds[0]));

    let allPermissions: string[] = [];

    if (roleIds.length > 1) {
      const morePerms = await client
        .select({ name: permissions.name })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionID, permissions.id))
        .where(eq(rolePermissions.roleID, roleIds[1]));
      allPermissions = [...permissionRows.map((p) => p.name), ...morePerms.map((p) => p.name)];
    } else {
      allPermissions = permissionRows.map((p) => p.name);
    }

    const uniquePermissions = [...new Set(allPermissions)];
    const isSuperAdmin = userRoleRows.some((r) => r.isSuperAdmin);

    return {
      ...user,
      roles: userRoleRows.map((r) => ({ id: r.roleId, name: r.roleName, isSuperAdmin: r.isSuperAdmin })),
      permissions: uniquePermissions,
      isSuperAdmin,
    };
  }

  static async findUserWithRolesByID(userID: string, client: QueryClient = db) {
    const user = await client.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.id, userID),
    });

    if (!user) return null;

    const userRoleRows = await client
      .select({
        roleId: roles.id,
        roleName: roles.name,
        isSuperAdmin: roles.isSuperAdmin,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleID, roles.id))
      .where(eq(userRoles.userID, user.id));

    if (userRoleRows.length === 0) return { ...user, roles: [], permissions: [], isSuperAdmin: false };

    const roleIds = userRoleRows.map((r) => r.roleId);

    const permissionRows = await client
      .select({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionID, permissions.id))
      .where(eq(rolePermissions.roleID, roleIds[0]));

    let allPermissions: string[] = [];

    if (roleIds.length > 1) {
      const morePerms = await client
        .select({ name: permissions.name })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionID, permissions.id))
        .where(eq(rolePermissions.roleID, roleIds[1]));
      allPermissions = [...permissionRows.map((p) => p.name), ...morePerms.map((p) => p.name)];
    } else {
      allPermissions = permissionRows.map((p) => p.name);
    }

    const uniquePermissions = [...new Set(allPermissions)];
    const isSuperAdmin = userRoleRows.some((r) => r.isSuperAdmin);

    return {
      ...user,
      roles: userRoleRows.map((r) => ({ id: r.roleId, name: r.roleName, isSuperAdmin: r.isSuperAdmin })),
      permissions: uniquePermissions,
      isSuperAdmin,
    };
  }

  static async allUserslist(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {

    return paginateQuery({
      query: db.query.userTable,
      countTable: userTable,
      searchColumns: [userTable.mobile, userTable.name, userTable.email],
      page: query.page,
      limit: query.limit,
      search: query.search,
      with: {
        contact: true
      }

    });
  }

  static async allStuff(){
    return db.query.staffProfiles.findMany({
      with: {
        user: true,
      },
    });
  }

  static async createStaff(
  data: CreateStaffInput,
  client: QueryClient = db
) {
  const [staff] = await client
    .insert(staffProfiles)
    .values(data)
    .returning();

  return staff;
}

static async updateStaff(
  staffID: string,
  data: UpdateStaffInput,
  client: QueryClient = db
) {
  const [staff] = await client
    .update(staffProfiles)
    .set(data)
    .where(eq(staffProfiles.id, staffID))
    .returning();

  return staff;
}
}