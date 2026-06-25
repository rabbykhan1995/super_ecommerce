import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { dbSchema } from "./relations"; // যেখানে সব টেবিল স্কিমা রেজিস্টার করা আছে
import db from "../drizzle/src";

// Drizzle-এর ট্রানজেকশন ক্লায়েন্টের টাইপ ডেফিনিশন
export type DbTransactionClient = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof dbSchema,
  ExtractTablesWithRelations<typeof dbSchema>
>;

/**
 * runInTransaction
 * @param callback একটি ফাংশন যা ট্রানজেকশনের ক্লায়েন্ট (tx) গ্রহণ করবে এবং ভেতরের সব কুয়েরি রান করবে।
 */
export const runInTransaction = async <T>(
  callback: (tx: DbTransactionClient) => Promise<T>
): Promise<T> => {
  try {
    // Drizzle-এর বিল্ট-ইন ট্রানজেকশন রান করা হচ্ছে
    return await db.transaction(async (tx) => {
      return await callback(tx);
    });
  } catch (error) {
    console.error("❌ Database Transaction Failed & Rolled Back:", error);
    throw error; // এক্সপ্রেসের গ্লোবাল এরর হ্যান্ডলারে পাঠানোর জন্য এররটি রি-থ্রো করা হলো
  }
};