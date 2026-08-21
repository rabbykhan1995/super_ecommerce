import { eq, inArray } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";
import { CreateStaffInput, UpdateStaffInput, UpdateUserInput, UserPayload } from "./auth.type";
import {
  userTable,
  userRole,
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

  static async findRolesByUserID(userID: string, client: QueryClient = db) {
    return client
      .select({
        id: roles.id,
        name: roles.name,
        isSuperAdmin: roles.isSuperAdmin,
      })
      .from(userRole)
      .innerJoin(roles, eq(userRole.roleID, roles.id))
      .where(eq(userRole.userID, userID));
  }

  static async findPermissionNamesByRoleIDs(roleIDs: string[], client: QueryClient = db) {
    if (roleIDs.length === 0) return [];

    return client
      .selectDistinct({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionID, permissions.id))
      .where(inArray(rolePermissions.roleID, roleIDs));
  }

  static async findStaffProfileByUserID(userID: string, client: QueryClient = db) {
    return client.query.staffProfiles.findFirst({
      where: (staff, { eq }) => eq(staff.userID, userID),
    });
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

static async allStuff() {
  return db.query.staffProfiles.findMany({
    with: {
      user: {
        with: {
          userRole: {
            with: {
              role: true,
            },
          },
        },
      },
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