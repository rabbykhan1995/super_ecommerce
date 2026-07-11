import db from "../../drizzle/src";
import { permissions } from "../auth/auth.table";

const PERMISSIONS_LIST = [
  // Product
  { name: "product:create", description: "Create products" },
  { name: "product:update", description: "Update products" },
  { name: "product:read", description: "Read products" },
  { name: "product:delete", description: "Delete products" },
  { name: "product:variant-list", description: "List product variants" },
  { name: "product:variant-create", description: "Create product variants" },
  { name: "product:variant-update", description: "Update product variants" },
  { name: "product:variant-delete", description: "Delete product variants" },
  { name: "product:batch-read", description: "Read product batches" },
  { name: "product:batch-create", description: "Create product batches" },
  { name: "product:batch-update", description: "Update product batches" },
  { name: "product:batch-delete", description: "Delete product batches" },
  { name: "product:fifo-batch", description: "View FIFO batches" },

  // Ledger
  { name: "ledger:create", description: "Create ledger entries" },
  { name: "ledger:read", description: "Read ledger entries" },

  // Sale
  { name: "sale:create", description: "Create sales" },
  { name: "sale:read", description: "Read sales" },
  { name: "sale:void", description: "Void sales" },

  // Purchase
  { name: "purchase:create", description: "Create purchases" },
  { name: "purchase:read", description: "Read purchases" },

  // Role
  { name: "role:create", description: "Create roles" },
  { name: "role:read", description: "Read roles" },
  { name: "role:update", description: "Update roles" },
  { name: "role:delete", description: "Delete roles" },
  { name: "role:assign", description: "Assign roles to users" },

  // User
  { name: "user:read", description: "Read users" },
  { name: "user:update", description: "Update users" },

  // Category
  { name: "category:create", description: "Create categories" },
  { name: "category:read", description: "Read categories" },
  { name: "category:update", description: "Update categories" },
  { name: "category:delete", description: "Delete categories" },

  // Brand
  { name: "brand:create", description: "Create brands" },
  { name: "brand:read", description: "Read brands" },
  { name: "brand:update", description: "Update brands" },
  { name: "brand:delete", description: "Delete brands" },

  // Unit
  { name: "unit:create", description: "Create units" },
  { name: "unit:read", description: "Read units" },
  { name: "unit:update", description: "Update units" },
  { name: "unit:delete", description: "Delete units" },

  // Contact
  { name: "contact:create", description: "Create contacts" },
  { name: "contact:read", description: "Read contacts" },
  { name: "contact:update", description: "Update contacts" },
  { name: "contact:delete", description: "Delete contacts" },

  // Account
  { name: "account:create", description: "Create accounts" },
  { name: "account:read", description: "Read accounts" },
  { name: "account:update", description: "Update accounts" },
  { name: "account:delete", description: "Delete accounts" },

  // Transaction
  { name: "transaction:create", description: "Create transactions" },
  { name: "transaction:read", description: "Read transactions" },

  // Report
  { name: "report:read", description: "Read reports" },

  // Expense
  { name: "expense:create", description: "Create expenses" },
  { name: "expense:read", description: "Read expenses" },
  { name: "expense:update", description: "Update expenses" },
  { name: "expense:delete", description: "Delete expenses" },

  // Damage
  { name: "damage:create", description: "Create damage records" },
  { name: "damage:read", description: "Read damage records" },
  { name: "damage:update", description: "Update damage records" },
  { name: "damage:delete", description: "Delete damage records" },

  // Cart
  { name: "cart:create", description: "Create cart entries" },
  { name: "cart:read", description: "Read cart entries" },
  { name: "cart:update", description: "Update cart entries" },
  { name: "cart:delete", description: "Delete cart entries" },

  // Warranty
  { name: "warranty:create", description: "Create warranty records" },
  { name: "warranty:read", description: "Read warranty records" },
  { name: "warranty:update", description: "Update warranty records" },
  { name: "warranty:delete", description: "Delete warranty records" },
];

export const seedPermissions = async () => {
  try {
    await db
      .insert(permissions)
      .values(PERMISSIONS_LIST)
      .onConflictDoNothing({ target: permissions.name });

    console.log("Permissions seeded successfully");
  } catch (error) {
    console.error("Error seeding permissions:", error);
  }
};

// Run directly
seedPermissions();
