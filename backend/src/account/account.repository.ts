import { eq, and, ne, desc, count, sql } from "drizzle-orm";
import { accountTable } from "./account.table";
import db from "../../drizzle/src";
type DBClient = typeof db;

export default class AccountRepository {

  static async findByID(id: number, client: DBClient = db) {
    const result = await client
      .select()
      .from(accountTable)
      .where(eq(accountTable.id, id))
      .limit(1);

    return result[0] || null;
  }

  static async findByName(name: string, excludeId?: number, client: DBClient = db) {
    const result = await client
      .select()
      .from(accountTable)
      .where(
        excludeId
          ? and(
              eq(accountTable.name, name.trim()),
              ne(accountTable.id, excludeId)
            )
          : eq(accountTable.name, name.trim())
      )
      .limit(1);

    return result[0] || null;
  }

  static async create(payload: any, client: DBClient = db) {
    const result = await client
      .insert(accountTable)
      .values({
        ...payload,
        name: payload.name.trim(),
        branch: payload.branch?.trim(),
      })
      .returning();

    return result[0];
  }

  static async findDefault(excludeId?: number, client: DBClient = db) {
    const result = await client
      .select()
      .from(accountTable)
      .where(
        excludeId
          ? and(
              eq(accountTable.isDefault, true),
              ne(accountTable.id, excludeId)
            )
          : eq(accountTable.isDefault, true)
      )
      .limit(1);

    return result[0] || null;
  }

  static async updateById(id: number, payload: any, client: DBClient = db) {
    const result = await client
      .update(accountTable)
      .set({
        ...payload,
        name: payload.name?.trim(),
        branch: payload.branch?.trim(),
        updatedAt: new Date(),
      })
      .where(eq(accountTable.id, id))
      .returning();

    return result[0] || null;
  }

  static async increaseAccountsAmount(accounts: any[], client: DBClient = db) {
    await Promise.all(
      accounts.map((acc) =>
        client
          .update(accountTable)
          .set({
            balance: sql`${accountTable.balance} + ${acc.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(accountTable.id, acc.accountID))
      )
    );
  }

  static async decreaseAccountsAmount(accounts: any[], client: DBClient = db) {
    await Promise.all(
      accounts.map((acc) =>
        client
          .update(accountTable)
          .set({
            balance: sql`${accountTable.balance} - ${acc.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(accountTable.id, acc.accountID))
      )
    );
  }

  static async getAllAccounts(client: DBClient = db) {
    return await client
      .select()
      .from(accountTable)
      .orderBy(desc(accountTable.createdAt));
  }
}