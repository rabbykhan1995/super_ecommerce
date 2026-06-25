import { eq, and, lte, gte, ilike, or, desc, sql, SQL } from "drizzle-orm";
import db , { QueryClient } from "../../drizzle/src";

import { transactionTable } from "./transaction.table"; // আপনার ড্রিসেল টেবিল
import { accountTable } from "../account/account.table";
import { contactTable } from "../contact/contact.table";

export default class TransactionRepository {
  constructor() {}

  /**
   * 💡 ১. Bulk Insert (createMany)
   */
  static async createMany(payload: any[], client: QueryClient = db) {
    return await client.insert(transactionTable).values(payload).returning();
  }

  /**
   * 💡 ২. Paginated List (মঙ্গুসের paginatedAggregate এর বিকল্প)
   * ড্রিসেলের Relational Query দিয়ে এটি মঙ্গুসের চেয়ে ১০ গুণ সহজে করা যায়
   */
static async paginatedList(options: {
    page: number;
    limit: number;
    search?: string;
    accountId?: number;
  }) {
    const { page = 1, limit = 10, search, accountId } = options;
    const offset = (page - 1) * limit;

    // 💡 সমাধান: এখানে অ্যারের টাইপ `SQL[]` বলে দিতে হবে, কারণ Drizzle-এর eq() বা and() ফাংশনগুলো SQL টাইপ রিটার্ন করে
    const conditions: SQL[] = []; 
    
    if (accountId) {
      // 💡 সমাধান ২: .append() এর জায়গায় .push() হবে
      conditions.push(eq(transactionTable.accountID, accountId)); 
    }

    // আপনার মেইন কুয়েরি
    const data = await db.query.transactionTable.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: limit,
      offset: offset,
      with: {
        // মঙ্গুসের lookup এর বদলে ডিরেক্ট রিলেশন জয়েন
        // (নিশ্চিত হয়ে নেবেন আপনার transactionTable-এর রিলেশনে 'account' নাম দেওয়া আছে কি না)
        account: {
          columns: { name: true }
        },
      }
    });

    // টোটাল কাউন্ট (পেজিনেশনের জন্য)
    // এখানেও কন্ডিশন অ্যাপ্লাই করা ভালো, যাতে ফিল্টার করা ডেটার একচুয়াল কাউন্ট পাওয়া যায়
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactionTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined); // 💡 কাউন্টেও ফিল্টার বসালাম

    return {
      docs: data,
      totalDocs: Number(totalCount?.count || 0), // নিশ্চিত করতে Number এ কনভার্ট করা হলো
      limit,
      page,
    };
  }
  /**
   * 💡 ৩. Find By ID
   */
  static async findById(id: number) {
    const result = await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.id, id))
      .limit(1);
    return result[0] || null;
  }

  /**
   * 💡 ৪. Transaction Details Aggregate
   * মঙ্গুসের জটিল $group, $unwind, $addFields এর বদলে SQL Join এবং 
   * Aggregate Functions (যেমন json_agg) দিয়ে এটি করা হয়।
   */
  static async transactionDetailsAggregate(options: {
    transactionId?: number;
    purchaseId?: number;
    saleId?: number;
    ledgerSnapshot: {
      balanceBefore: string;
      balanceAfter: string;
      discount: string;
      dueAmount: string;
    };
  }) {
    const { transactionId, purchaseId, saleId, ledgerSnapshot } = options;

    const conditions = [];
    if (transactionId) conditions.push(eq(transactionTable.id, transactionId));
    if (purchaseId) conditions.push(eq(transactionTable.purchaseID, purchaseId));
    if (saleId) conditions.push(eq(transactionTable.saleID, saleId));

    // Drizzle Core Select Query with Joins
    const result = await db
      .select({
        id: transactionTable.id,
        type: transactionTable.type,
        amount: transactionTable.amount,
        date: transactionTable.date,
        source: transactionTable.source,
        // অ্যাকাউন্ট ডিটেইলস অবজেক্ট আকারে আনা (মঙ্গুসের lookup + unwind এর মতো)
        account: {
          id: accountTable.id,
          name: accountTable.name,
        },
        
        // কন্টাক্ট বা কাস্টমার/সাপ্লায়ার ডিটেইলস (লেজার বা ভাউচার থেকে রিলেটেড)
        // আমরা রানটাইমে লেজারের স্ন্যাপশট অবজেক্টটি যোগ করে দিচ্ছি ($addFields এর মতো)
        ledger: {
          balanceBefore: sql`${ledgerSnapshot.balanceBefore}`,
          balanceAfter: sql`${ledgerSnapshot.balanceAfter}`,
          discount: sql`${ledgerSnapshot.discount}`,
          dueAmount: sql`${ledgerSnapshot.dueAmount}`,
        }
      })
      .from(transactionTable)
      .leftJoin(accountTable, eq(transactionTable.accountID, accountTable.id))
      .where(and(...conditions))
      .limit(1);

    return result[0] || null;
  }

  /**
   * 💡 ৫. Delete Transactions (রোলব্যাক বা ভাউচার ডিলিটের সময়)
   */
  static async deleteTransactions(
    conditions: { purchaseID?: number; saleID?: number; id?: number },
    client: QueryClient = db
  ) {
    const deleteFilters = [];
    if (conditions.purchaseID) deleteFilters.push(eq(transactionTable.purchaseID, conditions.purchaseID));
    if (conditions.saleID) deleteFilters.push(eq(transactionTable.saleID, conditions.saleID));
    if (conditions.id) deleteFilters.push(eq(transactionTable.id, conditions.id));

    return await client
      .delete(transactionTable)
      .where(and(...deleteFilters))
      .returning();
  }
}