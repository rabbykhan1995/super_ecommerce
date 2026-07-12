import { eq } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";
import { UpdateUserInput, UserPayload } from "./auth.type";
import {
  userTable,
  userRoles,
  roles,
  rolePermissions,
  permissions,
  staffProfiles,
} from "./auth.table";

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
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userID, user.id));

  if (userRoleRows.length === 0) return { ...user, roles: [], permissions: [], isSuperAdmin: false };

  const roleIds = userRoleRows.map((r) => r.roleId);

  const permissionRows = await client
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleIds[0]));

  let allPermissions: string[] = [];

  if (roleIds.length > 1) {
    const morePerms = await client
      .select({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleIds[1]));
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
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userID, user.id));

  if (userRoleRows.length === 0) return { ...user, roles: [], permissions: [], isSuperAdmin: false };

  const roleIds = userRoleRows.map((r) => r.roleId);

  const permissionRows = await client
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleIds[0]));

  let allPermissions: string[] = [];

  if (roleIds.length > 1) {
    const morePerms = await client
      .select({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleIds[1]));
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
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userID, user.id));

  if (userRoleRows.length === 0) return { ...user, roles: [], permissions: [], isSuperAdmin: false };

  const roleIds = userRoleRows.map((r) => r.roleId);

  const permissionRows = await client
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleIds[0]));

  let allPermissions: string[] = [];

  if (roleIds.length > 1) {
    const morePerms = await client
      .select({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleIds[1]));
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
}