                         ┌─────────────────────┐
                         │   Request আসলো     | 
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    authMiddleware    │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                                │
             Token নাই/Invalid                Token valid
                    │                                │
                    ▼                                ▼
        ┌───────────────────────┐        ┌───────────────────────┐
        │ ❌ 401 Unauthorized    │        │  req.user সেট হলো     │
        │   clearCookie          │        └───────────┬───────────┘
        └───────────────────────┘                     │
                                                        ▼
                                        ┌───────────────────────────────┐
                                        │ authorize(requiredPermission) │
                                        └───────────────┬───────────────┘
                                                         │
                                          ┌──────────────┴──────────────┐
                                          │                             │
                                    req.user নাই                  req.user আছে
                                          │                             │
                                          ▼                             ▼
                              ┌───────────────────┐      ┌───────────────────────────┐
                              │ ❌ 401 Unauthorized│      │ DB: userRoles + roles     │
                              └───────────────────┘      │ join → userID দিয়ে fetch  │
                                                          └─────────────┬─────────────┘
                                                                        │
                                                        ┌───────────────┴───────────────┐
                                                        │                                │
                                                 role নাই assigned                  role আছে
                                                        │                                │
                                                        ▼                                ▼
                                          ┌───────────────────────┐    ┌───────────────────────────────┐
                                          │ ❌ 403 No role assigned│    │ কোনো role এ isSuperAdmin=true? │
                                          └───────────────────────┘    └───────────────┬───────────────┘
                                                                                        │
                                                                    ┌───────────────────┴───────────────────┐
                                                                    │                                        │
                                                              হ্যাঁ (super admin)                        না
                                                                    │                                        │
                                                                    ▼                                        ▼
                                                    ┌───────────────────────────┐      ┌───────────────────────────────┐
                                                    │ ✅ next()                  │      │ requiredPermission খালি "" ?  │
                                                    │  সব permission bypass      │      └───────────────┬───────────────┘
                                                    └───────────────────────────┘                        │
                                                                                    ┌───────────────────┴───────────────────┐
                                                                                    │                                        │
                                                                              হ্যাঁ (খালি string)                      না (নির্দিষ্ট permission)
                                                                                    │                                        │
                                                                                    ▼                                        ▼
                                                                    ┌───────────────────────────┐    ┌───────────────────────────────────┐
                                                                    │ ✅ next()                  │    │ DB: rolePermissions + permissions  │
                                                                    │  শুধু login/role লাগবে      │    │ join → roleIds দিয়ে fetch          │
                                                                    └───────────────────────────┘    └─────────────────┬───────────────────┘
                                                                                                                        │
                                                                                                    ┌───────────────────┴───────────────────┐
                                                                                                    │                                        │
                                                                                            permission match পেলো              permission match পেলো না
                                                                                                    │                                        │
                                                                                                    ▼                                        ▼
                                                                                    ┌───────────────────────────┐    ┌───────────────────────────┐
                                                                                    │ ✅ next()                  │    │ ❌ 403 Permission denied   │
                                                                                    │  Controller এ যাবে         │    └───────────────────────────┘
                                                                                    └───────────────────────────┘

Legend:
  ✅ = request pass হয়ে controller এ পৌঁছাবে (next() কল হচ্ছে)
  ❌ = request reject হবে (401 / 403 error থ্রো হচ্ছে)



  1. users table
সব ধরনের user (admin, staff, customer সবাই) এখানে থাকবে — role আলাদা table এ manage হচ্ছে।
idnameemailmobilepasswordopenIDimageaddressu1Rabby Khanrabby@example.com01711111111$2b$10$hash...nullnullIshwardi, Pabnau2Karim Saleskarim@example.com01722222222$2b$10$hash...nullnullRajshahiu3John Customerjohn@example.com01733333333nullgoogle-oauth-id-xyzhttps://...Dhaka

লক্ষ্য করো: u3 এর password null, কারণ সে Google OAuth (openID) দিয়ে login করেছে — তোমার schema এই দুইটাই optional রেখেছে, তাই এটা flexible।

2. staff_profiles table
শুধু যারা internal staff/employee (customer না), তাদের এখানে extra info থাকবে।
iduserIdemployeeCodedesignationdepartmentsp1u1EMP-001Super AdminManagementsp2u2EMP-002Sales ExecutiveSales

u3 (customer) এর জন্য কোনো row এখানে থাকবে না — customer রা staff না।

3. roles table
idnamedescriptionisSuperAdminr1super_adminপূর্ণ system accesstruer2adminBusiness operations manage করেfalser3sales_staffশুধু sales/POS related কাজfalser4customerecommerce এ কেনাকাটা করেfalse
4. permissions table
resource:action convention মেনে।
idnamedescriptionp1product:createনতুন product যোগ করাp2product:updateProduct edit করাp3product:readProduct list/details দেখাp4ledger:readLedger দেখাp5product:variant-listVariant list দেখাp6product:fifo-batchFIFO batch তথ্য দেখা
5. role_permissions table (Role ↔ Permission mapping)
এখানেই আসল ম্যাজিক — কোন role কোন permission পাবে।
idroleIdpermissionId(role name → permission, readability জন্য)rp1r3p3sales_staff → product:readrp2r3p5sales_staff → product:variant-listrp3r2p1admin → product:createrp4r2p2admin → product:updaterp5r2p3admin → product:readrp6r2p4admin → ledger:read

super_admin (r1) এর জন্য কোনো row লাগবে না — কারণ isSuperAdmin: true থাকায় middleware এ সরাসরি bypass হয়ে যায়। এটাই তোমার design এর সুবিধা — permission table বড় না করেই admin কে সব access দেওয়া যায়।

6. user_roles table (User ↔ Role mapping)
iduserIdroleId(readability জন্য)ur1u1r1Rabby → super_adminur2u2r3Karim → sales_staffur3u3r4John → customer

Real flow দিয়ে বুঝি — Karim (Sales Staff) product:create করতে চাইলে কী হবে?
1. authMiddleware → token valid → req.user = { id: 'u2', ... }

2. authorize('product:create') চলবে:
   
   Step A: userRoles থেকে u2 এর role খোঁজা
           → পাওয়া গেলো roleId = r3 (sales_staff), isSuperAdmin = false

   Step B: role আছে ✅, কিন্তু super admin না ❌
   
   Step C: requiredPermission ('product:create') খালি না, তাই check করবে

   Step D: rolePermissions থেকে r3 এর সব permission বের করা
           → শুধু পাওয়া গেলো: product:read, product:variant-list

   Step E: 'product:create' কি এই list এ আছে? → না ❌

3. Result: 403 "You do not have permission: product:create"
আর Karim যদি product:read চায়:
Step D: r3 এর permissions = [product:read, product:variant-list]
Step E: 'product:read' list এ আছে? → হ্যাঁ ✅
Result: next() → ProductController.list চলবে
Seed script এর basic example (drizzle দিয়ে)
typescript// seed.ts
import db from "./drizzle/src";
import { roles, permissions, rolePermissions } from "./src/auth/auth.table";

async function seed() {
  // 1. Roles তৈরি
  const [superAdmin] = await db
    .insert(roles)
    .values({ name: "super_admin", description: "Full access", isSuperAdmin: true })
    .returning();

  const [salesStaff] = await db
    .insert(roles)
    .values({ name: "sales_staff", description: "Sales & POS access", isSuperAdmin: false })
    .returning();

  // 2. Permissions তৈরি
  const [productRead] = await db
    .insert(permissions)
    .values({ name: "product:read", description: "View products" })
    .returning();

  const [productCreate] = await db
    .insert(permissions)
    .values({ name: "product:create", description: "Create product" })
    .returning();

  // 3. Mapping — sales_staff শুধু product:read পাবে
  await db.insert(rolePermissions).values([
    { roleId: salesStaff.id, permissionId: productRead.id },
  ]);
}

seed();
এভাবে নতুন role আসলে (যেমন warehouse_staff), শুধু কোন কোন permission তার লাগবে সেটা rolePermissions এ map করে দিলেই হবে — code এ কিছু change করা লাগবে না।