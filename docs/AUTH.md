# Authentication & Authorization System

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          AUTH TABLES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐    │
│  │    users      │       │   user_roles  │       │    roles      │    │
│  ├──────────────┤       ├──────────────┤       ├──────────────┤    │
│  │ id (PK)      │──┐    │ id (PK)      │    ┌──│ id (PK)      │    │
│  │ name         │  │    │ user_id (FK) │◄───┘  │ name         │    │
│  │ email        │  └───►│ role_id (FK) │◄──────│ is_super_admin│    │
│  │ mobile       │       │ created_at   │       │ description  │    │
│  │ password     │       └──────────────┘       └──────────────┘    │
│  │ open_id      │              │                      │             │
│  │ image        │              │                      │             │
│  │ address      │              │                      │             │
│  │ created_at   │              │                      │             │
│  │ updated_at   │              │                      │             │
│  └──────────────┘              │                      │             │
│                                │                      │             │
│  ┌──────────────┐              │              ┌───────┴──────────┐  │
│  │  permissions  │       ┌─────┴────────┐     │ role_permissions │  │
│  ├──────────────┤       │              │     ├──────────────────┤  │
│  │ id (PK)      │◄──────│──────────────│─────│ id (PK)         │  │
│  │ name         │       │              │     │ role_id (FK)    │  │
│  │ description  │       └──────────────┘     │ permission_id(FK)│  │
│  │ created_at   │                            │ created_at      │  │
│  └──────────────┘                            └─────────────────┘  │
│                                                                     │
│  ┌──────────────┐                                                   │
│  │staff_profiles │                                                   │
│  ├──────────────┤                                                   │
│  │ id (PK)      │                                                   │
│  │ user_id (FK) │──► users.id                                      │
│  │ employee_code│                                                   │
│  │ designation  │                                                   │
│  │ department   │                                                   │
│  └──────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram

```
                    ┌─────────────────┐
                    │     users        │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌───────────────┐  ┌───────────┐  ┌───────────────┐
    │  user_roles    │  │ contacts  │  │staff_profiles │
    └───────┬───────┘  └───────────┘  └───────────────┘
            │
            ▼
    ┌───────────────┐
    │     roles      │
    └───────┬───────┘
            │
            ▼
    ┌───────────────────┐
    │ role_permissions   │
    └───────┬───────────┘
            │
            ▼
    ┌───────────────┐
    │  permissions   │
    └───────────────┘
```

## User Types & How They're Identified

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER TYPES                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CUSTOMER (Regular User)                                        │
│  ├── Created via: Register / Google OAuth                       │
│  ├── Has role in user_roles: NO                                 │
│  ├── Auth method: manual-login OR user-google-auth              │
│  └── Middleware: authMiddleware only                             │
│                                                                  │
│  ADMIN / STAFF                                                   │
│  ├── Created via: seed:admin / admin panel                      │
│  ├── Has role in user_roles: YES (1 or more roles)              │
│  ├── Auth method: admin-login OR admin-google-auth              │
│  └── Middleware: authMiddleware + adminMiddleware                │
│                                                                  │
│  SUPER ADMIN                                                     │
│  ├── Created via: seed:admin                                    │
│  ├── Has role with is_super_admin = true                        │
│  ├── Auth method: admin-login OR admin-google-auth              │
│  └── Middleware: authMiddleware + superAdminMiddleware           │
│       └── OR authMiddleware + authorize() (bypasses checks)     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Login Flow Diagrams

### Customer Login (Manual)

```
┌──────────┐     POST /api/auth/manual-login      ┌──────────────┐
│  Client   │ ─────────────────────────────────────►│   Server     │
└──────────┘                                       └──────┬───────┘
                                                          │
                                                          ▼
                                               ┌──────────────────┐
                                               │ validate schema  │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │ Find user by     │
                                               │ email or mobile  │
                                               └────────┬─────────┘
                                                        │
                                        ┌───────────────┼───────────────┐
                                        │               │               │
                                        ▼               ▼               ▼
                                ┌──────────┐   ┌──────────────┐  ┌──────────┐
                                │ Not found │   │ Has openID   │  │  Found   │
                                │ → 404     │   │ but no pass  │  │          │
                                └──────────┘   │ → 400 error  │  └────┬─────┘
                                               └──────────────┘       │
                                                                      ▼
                                                          ┌──────────────────┐
                                                          │ Compare password │
                                                          │ with bcrypt      │
                                                          └────────┬─────────┘
                                                                   │
                                                       ┌───────────┼───────────┐
                                                       │                       │
                                                       ▼                       ▼
                                               ┌──────────────┐       ┌──────────────┐
                                               │ Mismatch     │       │ Match        │
                                               │ → 404        │       │ → Generate   │
                                               └──────────────┘       │   JWT token  │
                                                                      └──────┬───────┘
                                                                             │
                                                                             ▼
                                                                    ┌──────────────────┐
                                                                    │ Set cookie       │
                                                                    │ Return token     │
                                                                    └──────────────────┘
```

### Customer Login (Google OAuth)

```
┌──────────┐     GET /api/auth/user-google-auth    ┌──────────────┐
│  Client   │ ─────────────────────────────────────►│   Server     │
└──────────┘                                       └──────┬───────┘
                                                          │
                                                          ▼
                                               ┌──────────────────┐
                                               │ Redirect to      │
                                               │ Google OAuth URL │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │ User logs in     │
                                               │ on Google        │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
┌──────────┐  GET /api/auth/user-google-callback  ┌──────────────┐
│  Client   │ ◄───────────────────────────────────│   Server     │
└──────────┘   Redirect to ecom client URL        └──────┬───────┘
                                                         │
                                                         ▼
                                              ┌──────────────────┐
                                              │ Exchange code     │
                                              │ for access token  │
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │ Fetch user info  │
                                              │ from Google API  │
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │ Find or create   │
                                              │ user in DB       │
                                              │ (set open_id)    │
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │ Generate JWT     │
                                              │ Set cookie       │
                                              └──────────────────┘
```

### Admin Login (Manual)

```
┌──────────┐     POST /api/auth/admin-login       ┌──────────────┐
│  Client   │ ─────────────────────────────────────►│   Server     │
└──────────┘                                       └──────┬───────┘
                                                          │
                                                          ▼
                                               ┌──────────────────┐
                                               │ validate schema  │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │ Find user with   │
                                               │ roles by email   │
                                               │ (joins user_roles│
                                               │  + roles tables) │
                                               └────────┬─────────┘
                                                        │
                                        ┌───────────────┼───────────────┐
                                        │               │               │
                                        ▼               ▼               ▼
                                ┌──────────┐   ┌──────────────┐  ┌──────────┐
                                │ Not found │   │ Has openID   │  │  Found   │
                                │ → 404     │   │ but no pass  │  │          │
                                └──────────┘   │ → 400 error  │  └────┬─────┘
                                               └──────────────┘       │
                                                                      ▼
                                                          ┌──────────────────┐
                                                          │ Compare password │
                                                          └────────┬─────────┘
                                                                   │
                                                       ┌───────────┼───────────┐
                                                       │                       │
                                                       ▼                       ▼
                                               ┌──────────────┐       ┌──────────────┐
                                               │ Mismatch     │       │ Match        │
                                               │ → 404        │       │              │
                                               └──────────────┘       └──────┬───────┘
                                                                             │
                                                                             ▼
                                                          ┌──────────────────┐
                                                          │ Check:           │
                                                          │ roles.length > 0 │
                                                          │ → 403 if empty   │
                                                          └────────┬─────────┘
                                                                   │
                                                                   ▼
                                                          ┌──────────────────┐
                                                          │ Get staffProfile │
                                                          │ Generate JWT     │
                                                          │ Return user data │
                                                          └──────────────────┘
```

### Admin Google OAuth

```
┌──────────┐     GET /api/auth/admin-google-auth   ┌──────────────┐
│  Client   │ ─────────────────────────────────────►│   Server     │
└──────────┘                                       └──────┬───────┘
                                                          │
                                                          ▼
                                               ┌──────────────────┐
                                               │ Redirect to      │
                                               │ Google OAuth URL │
                                               │ (admin redirect) │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │ Exchange code    │
                                              │ Fetch user info  │
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │ Find user with   │
                                              │ roles by email   │
                                              │                  │
                                              │ NOT found → 403  │
                                              │ "No admin account│
                                              │  for this email" │
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │ Set openID if    │
                                              │ not set          │
                                              │ Check roles > 0  │
                                              │ Generate JWT     │
                                              │ Redirect to admin│
                                              │ client with token│
                                              └──────────────────┘
```

## Middleware Protection Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MIDDLEWARE CHAIN                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  REQUEST                                                             │
│     │                                                                │
│     ▼                                                                │
│  ┌─────────────────────┐                                            │
│  │   authMiddleware     │  Verifies JWT token                       │
│  │                      │  Extracts user from token                 │
│  │  Token from:         │  Attaches req.user = { id, email, ... }  │
│  │  - Header: token     │                                           │
│  │  - Cookie: token     │                                           │
│  └──────────┬──────────┘                                            │
│             │                                                        │
│             ├──► For CUSTOMER routes (cart, profile, etc.)           │
│             │    → Access granted                                    │
│             │                                                        │
│             ▼                                                        │
│  ┌─────────────────────┐                                            │
│  │  adminMiddleware     │  Checks user has ANY role                  │
│  │                      │  Queries: user_roles + roles              │
│  │                      │  If no role → 403 "Admin access required" │
│  └──────────┬──────────┘                                            │
│             │                                                        │
│             ├──► For ADMIN routes (order management, etc.)           │
│             │    → Access granted                                    │
│             │                                                        │
│             ▼                                                        │
│  ┌─────────────────────┐                                            │
│  │ superAdminMiddleware │  Checks user has role with                 │
│  │                      │  is_super_admin = true                    │
│  │                      │  If not → 403 "Super admin access required"│
│  └──────────┬──────────┘                                            │
│             │                                                        │
│             ├──► For SUPER ADMIN only routes                        │
│             │                                                        │
│             ▼                                                        │
│  ┌─────────────────────┐                                            │
│  │   authorize(perm)    │  RBAC permission check                    │
│  │                      │                                           │
│  │  Steps:              │                                           │
│  │  1. Get user's roles │                                           │
│  │  2. Super admin?     │──► YES → Bypass, access granted           │
│  │  3. No perm needed?  │──► YES → Access granted                   │
│  │  4. Get permissions  │                                           │
│  │     for user's roles │                                           │
│  │  5. Has perm?        │──► YES → Access granted                   │
│  │                      │──► NO  → 403 "No permission: xxx"         │
│  └─────────────────────┘                                            │
│                                                                      │
│  CONTROLLER HANDLER                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Route Protection Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ROUTE → MIDDLEWARE MAPPING                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PUBLIC (No Auth)                                                    │
│  ├── POST /api/auth/register-manually                               │
│  ├── POST /api/auth/manual-login                                    │
│  ├── POST /api/auth/admin-login                                     │
│  ├── POST /api/auth/send-email-verify-otp                           │
│  ├── POST /api/auth/send-forget-password-otp                        │
│  ├── POST /api/auth/reset-password                                  │
│  ├── GET  /api/auth/user-google-auth                                │
│  ├── GET  /api/auth/user-google-callback                            │
│  ├── GET  /api/auth/admin-google-auth                               │
│  └── GET  /api/auth/admin-google-callback                           │
│                                                                      │
│  CUSTOMER (authMiddleware)                                           │
│  ├── GET  /api/auth/get-profile                                     │
│  ├── GET  /api/auth/logout                                          │
│  ├── POST /api/auth/checkout-mobile                                 │
│  ├── GET  /api/cart/*                                               │
│  ├── GET  /api/contact/*                                            │
│  └── ... other customer endpoints                                   │
│                                                                      │
│  ADMIN (authMiddleware + adminMiddleware)                            │
│  ├── * /api/order/*        (uses adminMiddleware)                   │
│  ├── * /api/image/*        (uses adminMiddleware)                   │
│  ├── * /api/ecom/*         (uses adminMiddleware)                   │
│  └── ... other admin-only endpoints                                 │
│                                                                      │
│  RBAC (authMiddleware + authorize("permission:name"))                │
│  ├── GET    /api/roles/permissions     → authorize("role:read")     │
│  ├── POST   /api/roles/create          → authorize("role:create")   │
│  ├── GET    /api/roles/list            → authorize("role:read")     │
│  ├── PUT    /api/roles/:id/permissions → authorize("role:update")   │
│  ├── DELETE /api/roles/:id             → authorize("role:delete")   │
│  ├── POST   /api/roles/assign-user     → authorize("role:assign")   │
│  └── POST   /api/roles/remove-user     → authorize("role:assign")   │
│                                                                      │
│  CUSTOMER + ADMIN (authMiddleware only - both can access)            │
│  ├── * /api/product/*                                                            │
│  ├── * /api/category/*                                                           │
│  ├── * /api/brand/*                                                              │
│  ├── * /api/unit/*                                                               │
│  ├── * /api/sale/*                                                               │
│  ├── * /api/purchase/*                                                           │
│  ├── * /api/expense/*                                                            │
│  └── ... other shared endpoints                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Permission Format Convention

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PERMISSION NAMING                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Format: <resource>:<action>                                        │
│                                                                      │
│  Examples:                                                          │
│  ├── product:create        → Can create products                    │
│  ├── product:read          → Can read/view products                 │
│  ├── product:update        → Can update products                    │
│  ├── product:delete        → Can delete products                    │
│  ├── role:create           → Can create roles                       │
│  ├── role:read             → Can view roles                         │
│  ├── role:assign           → Can assign roles to users              │
│  ├── sale:create           → Can create sales                       │
│  ├── ledger:read           → Can view ledger entries                │
│  └── ...                                                             │
│                                                                      │
│  How authorize() checks:                                            │
│  1. User has role with is_super_admin=true? → ALLOW (bypass)       │
│  2. User's role has permission "product:create"? → ALLOW           │
│  3. Otherwise → 403 Forbidden                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Seed Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    bun run seed:admin                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step 1: Seed Permissions                                            │
│  ├── Inserts all permissions from PERMISSIONS_LIST                  │
│  └── On conflict (name) → do nothing                                │
│                                                                      │
│  Step 2: Create Super Admin Role                                     │
│  ├── Insert role: { name: "Super Admin", isSuperAdmin: true }       │
│  └── On conflict (name) → do nothing, fetch existing                │
│                                                                      │
│  Step 3: Create/Update Admin User                                    │
│  ├── Check if user exists by email                                  │
│  ├── If exists → update password + name                             │
│  └── If not exists → insert new user with hashed password           │
│                                                                      │
│  Step 4: Assign Role to User                                         │
│  ├── Check if user_roles entry exists                               │
│  ├── If not exists → insert { user_id, role_id }                    │
│  └── If exists → skip                                               │
│                                                                      │
│  Result: Admin user can login at POST /api/auth/admin-login         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Token Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    JWT TOKEN PAYLOAD                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  {                                                                  │
│    "id": "uuid",        ← user.id from users table                 │
│    "name": "string",    ← user.name                                │
│    "email": "string",   ← user.email                               │
│    "mobile": "string"   ← user.mobile (optional)                   │
│  }                                                                  │
│                                                                      │
│  Note: Token does NOT contain roles or permissions.                 │
│  Roles/permissions are fetched from DB on each request              │
│  via adminMiddleware or authorize() middleware.                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Files Reference

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FILE LOCATIONS                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Schema & Tables                                                    │
│  └── src/auth/auth.table.ts        ← All auth-related tables        │
│                                                                      │
│  Auth Logic                                                         │
│  ├── src/auth/auth.service.ts      ← Business logic                 │
│  ├── src/auth/auth.repository.ts   ← DB queries                     │
│  ├── src/auth/auth.controller.ts   ← Request handlers               │
│  ├── src/auth/auth.route.ts        ← Route definitions              │
│  └── src/auth/auth.type.ts         ← TypeScript types               │
│                                                                      │
│  Middleware                                                         │
│  ├── middlewares/auth.middleware.ts     ← JWT verification           │
│  ├── middlewares/admin.middleware.ts    ← Checks user has role       │
│  ├── middlewares/superAdmin.middleware.ts ← Checks is_super_admin   │
│  └── middlewares/rbac.middleware.ts     ← Permission-based auth     │
│                                                                      │
│  Seed                                                               │
│  └── src/admin/seed-super-admin.ts ← Creates admin user + role      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Manual Database Setup (Step-by-Step SQL Guide)

This section shows how to create users, roles, and assignments directly in the database using SQL.

### Overview: Which ID Goes Where

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HOW IDs FLOW BETWEEN TABLES                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Create user in "users"                                          │
│     └──→ Get user.id (UUID)                                         │
│                                                                      │
│  2. Create role in "roles"                                          │
│     └──→ Get role.id (UUID)                                         │
│                                                                      │
│  3. Link user ↔ role in "user_roles"                                │
│     ├── user_roles.user_id  = users.id    (from step 1)             │
│     └── user_roles.role_id  = roles.id    (from step 2)             │
│                                                                      │
│  4. (Optional) Link role ↔ permission in "role_permissions"         │
│     ├── role_permissions.role_id       = roles.id   (from step 2)   │
│     └── role_permissions.permission_id = permissions.id             │
│                                                                      │
│  5. (Optional) Create staff profile in "staff_profiles"             │
│     └── staff_profiles.user_id = users.id  (from step 1)            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 1: Create a Regular Customer (No Role)

A customer is just a user with NO entry in `user_roles`.

```sql
-- Generate a bcrypt hashed password first (use the app's Helper.hashPassword)
-- For plain text testing, you can use an online bcrypt tool

-- Insert customer
INSERT INTO "users" ("id", "name", "email", "password", "mobile", "created_at", "updated_at")
VALUES (
  gen_random_uuid(),
  'John Doe',
  'john@example.com',
  '$2b$10$<hashed_password_here>',
  '01712345678',
  NOW(),
  NOW()
);

-- That's it! No role assigned = customer.
-- Can login via POST /api/auth/manual-login
```

```
┌─────────────────────────────────────────────────────────────────────┐
│  CUSTOMER CREATION FLOW                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  users          user_roles         roles         permissions        │
│  ┌──────┐       ┌──────┐          ┌──────┐       ┌──────┐         │
│  │ id=1 │       │      │          │      │       │      │         │
│  │ name │       │      │          │      │       │      │         │
│  │ email│       │      │          │      │       │      │         │
│  └──────┘       └──────┘          └──────┘       └──────┘         │
│    ✅              ❌ (empty)        ❌              ❌              │
│                                                                      │
│  Result: User exists but has NO role → Customer                     │
│  Login via: POST /api/auth/manual-login                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 2: Create a Role

```sql
-- Create a custom role (e.g., "Manager")
INSERT INTO "roles" ("id", "name", "is_super_admin", "description")
VALUES (
  gen_random_uuid(),
  'Manager',
  false,                -- false = regular admin, true = super admin
  'Manager with limited access'
);

-- Note the role ID returned (you'll need it for step 4)
```

```sql
-- Create a Super Admin role
INSERT INTO "roles" ("id", "name", "is_super_admin", "description")
VALUES (
  gen_random_uuid(),
  'Super Admin',
  true,                 -- true = super admin (bypasses all permission checks)
  'Full system access'
);
```

### Step 3: Create a User (for Admin/Staff)

```sql
-- Insert user who will become an admin/staff
INSERT INTO "users" ("id", "name", "email", "password", "mobile", "created_at", "updated_at")
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@example.com',
  '$2b$10$<hashed_password_here>',
  '01711111111',
  NOW(),
  NOW()
);

-- Note the user ID returned (you'll need it for step 4)
```

### Step 4: Assign Role to User (Link User ↔ Role)

```sql
-- Link user to role in user_roles table
INSERT INTO "user_roles" ("id", "user_id", "role_id", "created_at")
VALUES (
  gen_random_uuid(),
  '<user_id_from_step_3>',    -- e.g., 'a1b2c3d4-...'
  '<role_id_from_step_2>',    -- e.g., 'e5f6g7h8-...'
  NOW()
);

-- Now this user can login via POST /api/auth/admin-login
-- They will have the role assigned and middleware will recognize them as admin
```

```
┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN CREATION FLOW                                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step 3: users                Step 2: roles                          │
│  ┌──────────────┐            ┌──────────────┐                       │
│  │ id = 'abc'   │            │ id = 'xyz'   │                       │
│  │ name = Admin │            │ name = Manager│                       │
│  │ email = ...  │            │ is_super = false│                     │
│  └──────┬───────┘            └──────┬───────┘                       │
│         │                           │                                │
│         │    Step 4: user_roles     │                                │
│         │    ┌──────────────────┐   │                                │
│         └───►│ user_id = 'abc'  │◄──┘                                │
│              │ role_id = 'xyz'  │                                    │
│              └──────────────────┘                                    │
│                                                                      │
│  Result: User has role → Can login as admin                         │
│  Login via: POST /api/auth/admin-login                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 5: Create Staff Profile (Optional)

Staff profiles are for employees who need an employee code, designation, and department.

```sql
-- First, create the user (Step 3) and assign role (Step 4)

-- Then create staff profile
INSERT INTO "staff_profiles" ("id", "user_id", "employee_code", "designation", "department", "created_at", "updated_at")
VALUES (
  gen_random_uuid(),
  '<user_id>',              -- same user_id from step 3
  'EMP-001',                -- unique employee code
  'Senior Manager',         -- designation
  'Sales',                  -- department
  NOW(),
  NOW()
);
```

### Step 6: Assign Permissions to Role

```sql
-- First, check existing permissions
SELECT id, name FROM "permissions";

-- Assign specific permissions to a role
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "created_at")
VALUES (
  gen_random_uuid(),
  '<role_id>',              -- role to assign permissions to
  '<permission_id>',        -- e.g., permission for "product:create"
  NOW()
);

-- Or assign multiple permissions at once
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "created_at")
VALUES
  (gen_random_uuid(), '<role_id>', (SELECT id FROM "permissions" WHERE name = 'product:create'), NOW()),
  (gen_random_uuid(), '<role_id>', (SELECT id FROM "permissions" WHERE name = 'product:read'), NOW()),
  (gen_random_uuid(), '<role_id>', (SELECT id FROM "permissions" WHERE name = 'product:update'), NOW()),
  (gen_random_uuid(), '<role_id>', (SELECT id FROM "permissions" WHERE name = 'sale:create'), NOW()),
  (gen_random_uuid(), '<role_id>', (SELECT id FROM "permissions" WHERE name = 'sale:read'), NOW());
```

### Complete Example: Create Super Admin from Scratch

```sql
-- 1. Create Super Admin role
INSERT INTO "roles" ("id", "name", "is_super_admin", "description")
VALUES ('11111111-1111-1111-1111-111111111111', 'Super Admin', true, 'Full system access')
ON CONFLICT (name) DO NOTHING;

-- 2. Create admin user (password: admin123)
INSERT INTO "users" ("id", "name", "email", "password", "created_at", "updated_at")
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Super Admin',
  'admin@gmail.com',
  '$2b$10$xVrw/aE7l6l5vIrYJuuuuedaBNbAZPx2MPrBSe9LN6oWsOfkpBKIe',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 3. Assign role to user
INSERT INTO "user_roles" ("id", "user_id", "role_id", "created_at")
VALUES (
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',   -- user id
  '11111111-1111-1111-1111-111111111111',   -- role id
  NOW()
);

-- 4. (Optional) Assign all permissions to Super Admin role
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "created_at")
SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', id, NOW()
FROM "permissions"
ON CONFLICT DO NOTHING;
```

### Complete Example: Create Staff (Cashier) from Scratch

```sql
-- 1. Create Cashier role
INSERT INTO "roles" ("id", "name", "is_super_admin", "description")
VALUES ('33333333-3333-3333-3333-333333333333', 'Cashier', false, 'Cashier role')
ON CONFLICT (name) DO NOTHING;

-- 2. Create staff user
INSERT INTO "users" ("id", "name", "email", "password", "created_at", "updated_at")
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Jane Cashier',
  'jane@example.com',
  '$2b$10$<hashed_password>',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 3. Assign role to user
INSERT INTO "user_roles" ("id", "user_id", "role_id", "created_at")
VALUES (
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  NOW()
);

-- 4. Create staff profile
INSERT INTO "staff_profiles" ("id", "user_id", "employee_code", "designation", "department", "created_at", "updated_at")
VALUES (
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444',
  'EMP-002',
  'Cashier',
  'Sales',
  NOW(),
  NOW()
);

-- 5. Assign limited permissions to Cashier role
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "created_at")
VALUES
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', (SELECT id FROM "permissions" WHERE name = 'product:read'), NOW()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', (SELECT id FROM "permissions" WHERE name = 'sale:create'), NOW()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', (SELECT id FROM "permissions" WHERE name = 'sale:read'), NOW()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', (SELECT id FROM "permissions" WHERE name = 'cart:create'), NOW()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', (SELECT id FROM "permissions" WHERE name = 'contact:read'), NOW());
```

### Verification Queries

```sql
-- Check all users and their roles
SELECT
  u.id AS user_id,
  u.name,
  u.email,
  r.name AS role_name,
  r.is_super_admin
FROM "users" u
LEFT JOIN "user_roles" ur ON u.id = ur.user_id
LEFT JOIN "roles" r ON ur.role_id = r.id;

-- Check permissions for a specific role
SELECT
  r.name AS role_name,
  p.name AS permission_name
FROM "roles" r
JOIN "role_permissions" rp ON r.id = rp.role_id
JOIN "permissions" p ON rp.permission_id = p.id
WHERE r.name = 'Super Admin';

-- Check staff profiles
SELECT
  u.name,
  sp.employee_code,
  sp.designation,
  sp.department
FROM "staff_profiles" sp
JOIN "users" u ON sp.user_id = u.id;

-- Check if a user has a specific permission
SELECT EXISTS (
  SELECT 1
  FROM "user_roles" ur
  JOIN "role_permissions" rp ON ur.role_id = rp.role_id
  JOIN "permissions" p ON rp.permission_id = p.id
  WHERE ur.user_id = '<user_id>'
    AND p.name = 'product:create'
) AS has_permission;
```

### Quick Reference: Table Insert Order

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INSERT ORDER (Dependency Chain)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step   Table              Required IDs From                         │
│  ────   ─────              ─────────────────                         │
│   1     permissions        (none - standalone)                      │
│   2     roles              (none - standalone)                      │
│   3     users              (none - standalone)                      │
│   4     user_roles         users.id + roles.id                      │
│   5     role_permissions   roles.id + permissions.id                │
│   6     staff_profiles     users.id                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  permissions ──┐                                             │   │
│  │                ├──► role_permissions                          │   │
│  │  roles ────────┤                                             │   │
│  │                ├──► user_roles                                │   │
│  │  users ────────┘                                             │   │
│  │                └──► staff_profiles                            │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Order matters: Insert in steps 1-3 first, then 4-6                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
