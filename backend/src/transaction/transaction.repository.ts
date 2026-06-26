import { eq, and, sql} from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";
import { transactionTable } from "./transaction.table"; // আপনার ড্রিসেল টেবিল
import { accountTable } from "../account/account.table";
import { TransactionPayload, TxSource, TxType } from "./transaction.type";
import { paginateQuery } from "../../utils/queryBuilder";

export default class TransactionRepository {
  constructor() { }

  /**
   * 💡 ১. Bulk Insert (createMany)
   */
  static async createMany(payload: TransactionPayload[], client: QueryClient = db) {
    return await client.insert(transactionTable).values(payload).returning();
  }

  static async create(payload: TransactionPayload, client: QueryClient = db) {
    return await client.insert(transactionTable).values(payload).returning();
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
    conditions: { purchaseID?: number; saleID?: number; id?: number; },
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


  static async accTransictionList(query: {
    page?: number;
    limit?: number;
    search?: string;
    accountID?: number;
    type?: TxType;
    source?: TxSource;
  }) {

    return paginateQuery({
      query: db.query.transactionTable,
      countTable: transactionTable,
      searchColumns: [transactionTable.txNo],
      page: query.page,
      limit: query.limit,
      search: query.search,
      where: [
        ...(query.accountID ? [eq(transactionTable.accountID, query.accountID)] : []),
        ...(query.type ? [eq(transactionTable.type, query.type)] : []),
        ...(query.source ? [eq(transactionTable.source, query.source)] : [])
      ],
      with: {
        accounts: true,
        transactions: true,
      },
    });
  }
}