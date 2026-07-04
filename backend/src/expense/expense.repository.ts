import {
  paginateQuery
} from "../../utils/queryBuilder";

import {
  Expense,
  ExpensePayload,
  ExpenseType,
} from "./expense.type";
import db, { QueryClient } from "../../drizzle/src";
import { expenseTable, expenseTypeTable } from "./expense.table";
import { eq, gte, lte, SQL } from "drizzle-orm";

export default class ExpenseRepository {
private static buildListFilter(query: Record<string, any>): SQL[] {
  const where: SQL[] = [];

  if (query.expenseTypeId) {
    where.push(eq(expenseTable.expenseTypeId, query.expenseTypeId));
  }

  if (query.fromDate) {
    where.push(
      gte(expenseTable.expenseDate, new Date(query.fromDate))
    );
  }

  if (query.toDate) {
    where.push(
      lte(expenseTable.expenseDate, new Date(query.toDate))
    );
  }

  return where;
}

  static async createExpenseType(
          payload: ExpensePayload,
          client: QueryClient = db
      ): Promise<Expense | null> {
          const [expense] = await client
              .insert(expenseTable)
              .values(payload)
              .returning();
  
          return expense ?? null;
      }

  static async findExpenseType(
    name: string,
    client:QueryClient = db,
  ): Promise<ExpenseType | null> {
          const [expenseType] = await client
              .select()
              .from(expenseTypeTable)
              .where(eq(expenseTypeTable.name, name))
  
          return expenseType ?? null;
      }

static async findExpenseTypeById(
  expenseTypeId: number,
  client: QueryClient = db,
): Promise<ExpenseType | null> {
  const [expenseType] = await client
    .select()
    .from(expenseTypeTable)
    .where(eq(expenseTypeTable.id, expenseTypeId));

  return expenseType ?? null;
}
  static async allExpenseType(): Promise<ExpenseType[] | []> {
          const expenseTypes = await db
              .select()
              .from(expenseTypeTable)
  
          return expenseTypes;
      }

static async updateExpenseType(
  id: number,
  name: string,
  client: QueryClient = db,
): Promise<ExpenseType | null> {
  const [expenseType] = await client
    .update(expenseTypeTable)
    .set({
      name,
    })
    .where(eq(expenseTypeTable.id, id))
    .returning();

  return expenseType ?? null;
}

static async expenseTypeExistOnAnyExpense(
  expenseTypeId: number,
  client: QueryClient = db,
): Promise<boolean> {
  const [expense] = await client
    .select({ id: expenseTable.id })
    .from(expenseTable)
    .where(eq(expenseTable.expenseTypeId, expenseTypeId))
    .limit(1);

  return !!expense;
}
static async deleteExpenseType(
  id: number,
  client: QueryClient = db,
): Promise<ExpenseType | null> {
  const [expenseType] = await client
    .delete(expenseTypeTable)
    .where(eq(expenseTypeTable.id, id))
    .returning();

  return expenseType ?? null;
}
static async createExpense(
  payload: ExpensePayload,
  client: QueryClient = db,
): Promise<Expense | null> {
  const [expense] = await client
    .insert(expenseTable)
    .values(payload)
    .returning();

  return expense ?? null;
}

  static async deleteExpense(
  id: number,
  client: QueryClient = db,
): Promise<Expense | null> {
  const [expense] = await client
    .delete(expenseTable)
    .where(eq(expenseTable.id, id))
    .returning();

  return expense ?? null;
}
static async list(query: Record<string, any>) {
  return paginateQuery({
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 10,

    query: db.query.expenseTable,

    countTable: expenseTable,

    where: this.buildListFilter(query),

    search: query.search,

    searchColumns: [
      expenseTable.note,
    ],

    with: {
      expenseType: true,
    },
  });
}

static async findExpenseById(
  id: number,
  client: QueryClient = db,
): Promise<Expense | null> {
  const [expense] = await client
    .select()
    .from(expenseTable)
    .where(eq(expenseTable.id, id));

  return expense ?? null;
}
}
