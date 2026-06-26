import {
  SQL,
  and,
  count,
  ilike,
  or,
} from "drizzle-orm";
import db, { QueryClient } from "../drizzle/src";


export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

interface PaginateOptions<T> {
  page?: number;
  limit?: number;

  search?: string;

  searchColumns?: any[];

  where?: SQL[];

  query: {
    findMany: (args: any) => Promise<T[]>;
  };

  countTable: any;

  db?: QueryClient;

  with?: Record<string, any>;
}

export const paginateQuery = async <T>({
  db:QueryClient = db,
  query,
  countTable,

  page = 1,
  limit = 10,

  search,
  searchColumns = [],

  where,
  with: relations,
}: PaginateOptions<T>): Promise<PaginatedResult<T>> => {
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [...(where ?? [])];

  const finalWhere =
    conditions.length > 0
      ? and(...conditions)
      : undefined;

  if (search && searchColumns.length) {
    conditions.push(
      or(
        ...searchColumns.map((column) =>
          ilike(column, `%${search}%`)
        )
      )!
    );
  }



  const [items, totalRows] = await Promise.all([
    query.findMany({
      where: finalWhere,
      with: relations,
      limit,
      offset,
    }),

    db
      .select({
        total: count(),
      })
      .from(countTable)
      .where(finalWhere),
  ]);

  return {
    items: items as T[],
    total: Number(totalRows[0]?.total ?? 0),
    page,
    limit,
  };
};