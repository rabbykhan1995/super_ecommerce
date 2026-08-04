import { eq } from "drizzle-orm";
import db from "../../drizzle/src";
import {
  permissions,
  roles,
  userRoles,
  userTable,
} from "../auth/auth.table";
import Helper from "../../utils/helper";
import { PERMISSIONS_LIST } from "./seed-permissions";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Super Admin";
const SUPER_ADMIN_ROLE = "Super Admin";


async function seed() {
  try {
    // 1. Seed permissions
    await db
      .insert(permissions)
      .values(PERMISSIONS_LIST)
      .onConflictDoNothing({ target: permissions.name });
    console.log("Permissions seeded.");

    // 2. Create Super Admin role
    const [role] = await db
      .insert(roles)
      .values({
        name: SUPER_ADMIN_ROLE,
        isSuperAdmin: true,
        description: "Full system access",
      })
      .onConflictDoNothing({ target: roles.name })
      .returning();

    let roleId: string;
    if (role) {
      roleId = role.id;
      console.log(`Super Admin role created: ${roleId}`);
    } else {
      const existing = await db.query.roles.findFirst({
        where: (r, { eq }) => eq(r.name, SUPER_ADMIN_ROLE),
      });
      roleId = existing!.id;
      console.log(`Super Admin role already exists: ${roleId}`);
    }

    // 3. Create or update admin user
    const hashedPassword = await Helper.hashPassword(ADMIN_PASSWORD);

    const existingUser = await db.query.userTable.findFirst({
      where: (u, { eq }) => eq(u.email, ADMIN_EMAIL),
    });

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
      await db
        .update(userTable)
        .set({ password: hashedPassword, name: ADMIN_NAME })
        .where(eq(userTable.email, ADMIN_EMAIL));
      console.log(`Admin user updated: ${userId}`);
    } else {
      const [user] = await db
        .insert(userTable)
        .values({
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          password: hashedPassword,
        })
        .returning();
      userId = user!.id;
      console.log(`Admin user created: ${userId}`);
    }

    // 4. Assign role to user
    const existingUserRole = await db.query.userRoles.findFirst({
      where: (ur, { and, eq }) =>
        and(eq(ur.userID, userId), eq(ur.roleId, roleId)),
    });

    if (!existingUserRole) {
      await db.insert(userRoles).values({ userID: userId, roleId });
      console.log("Super Admin role assigned to user.");
    } else {
      console.log("Super Admin role already assigned to user.");
    }

    console.log("\n--- Done ---");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log("Login at /login in the admin panel.");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();

// from root of the backend project
// bun run src/admin/seed-permissions.ts
// To run this,  bun run seed:admin

// amader k 2 ta jinish korte hobe , 1, sob role gula db te insert korte hobe, then 1 ta user create hobe, sei user k admin bananor jonno seed admin chalate hobe, ar sei file a sei jinish gula dite hobe.