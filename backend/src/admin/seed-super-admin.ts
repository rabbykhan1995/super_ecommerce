import db from "../../drizzle/src";
import {
  permissions,
  roles,
  userRoles,
  userTable,
} from "../auth/auth.table";
import Helper from "../../utils/helper";
import { PERMISSIONS_LIST } from "./seed-permissions";

const ADMIN_EMAIL = "rabbykhan082020@gmail.com";
const ADMIN_PASSWORD = "abrar12345";
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

    // 3. Create admin user
    const hashedPassword = await Helper.hashPassword(ADMIN_PASSWORD);

    const [user] = await db
      .insert(userTable)
      .values({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
      })
      .onConflictDoNothing({ target: userTable.email })
      .returning();

    let userId: string;
    if (user) {
      userId = user.id;
      console.log(`Admin user created: ${userId}`);
    } else {
      const existing = await db.query.userTable.findFirst({
        where: (u, { eq }) => eq(u.email, ADMIN_EMAIL),
      });
      userId = existing!.id;
      console.log(`Admin user already exists: ${userId}`);
    }

    // 4. Assign role to user
    await db
      .insert(userRoles)
      .values({ userID: userId, roleId })
      .onConflictDoNothing();
    console.log("Super Admin role assigned to user.");

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