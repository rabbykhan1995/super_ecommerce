import {
  OnlySaleReturnPayload,
  SaleReturn,
  SaleReturnItem,
  SaleReturnItemPayload,
} from "./sale_return.type";
import { paginateQuery } from "../../utils/queryBuilder";
import {
  saleReturnItemsTable,
  saleReturnTable,
} from "./sale_return.table";
import { eq, count } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";

export default class SaleReturnRepository {
  static async saleReturnCreate(
    payload: OnlySaleReturnPayload,
    client: QueryClient = db,
  ): Promise<SaleReturn> {
    const [saleReturn] = await client
      .insert(saleReturnTable)
      .values(payload)
      .returning();

    return saleReturn;
  }

  static async saleReturnItemCreate(
    payload: SaleReturnItemPayload,
    client: QueryClient = db,
  ): Promise<SaleReturnItem> {
    const [item] = await client
      .insert(saleReturnItemsTable)
      .values(payload)
      .returning();

    return item;
  }

  static async findByID(
    returnID: number,
    client: QueryClient = db,
  ): Promise<SaleReturn> {
    const [saleReturn] = await client
      .select()
      .from(saleReturnTable)
      .where(eq(saleReturnTable.id, returnID))
      .limit(1);

    return saleReturn;
  }

  static async deleteSaleReturnByID(
    returnID: number,
    client: QueryClient = db,
  ) {
    const deleted = await client
      .delete(saleReturnTable)
      .where(eq(saleReturnTable.id, returnID));

    return deleted;
  }

  static async list(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    return paginateQuery({
      query: db.query.saleReturnTable,
      countTable: saleReturnTable,
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }

  static async itemsBySaleReturnID(
    returnID: number,
    client: QueryClient = db,
  ) {
    return client.query.saleReturnItemsTable.findMany({
      where: (items, { eq }) => eq(items.saleReturnID, returnID),
    });
  }

  static async countOtherSaleReturns(
    saleID: number,
    excludeReturnID: number,
    client: QueryClient = db,
  ): Promise<number> {
    const [totalAll] = await client
      .select({ total: count() })
      .from(saleReturnTable)
      .where(eq(saleReturnTable.saleID, saleID));

    return (totalAll?.total ?? 0) - 1;
  }

  static async getSaleReturnInvoice(
    saleReturnID: number,
    client: QueryClient = db,
  ) {
    const saleReturn = await client.query.saleReturnTable.findFirst({
      where: eq(saleReturnTable.id, saleReturnID),
      with: {
        customer: true,
        sale: true,
      },
    });

    const items = await client.query.saleReturnItemsTable.findMany({
      where: eq(saleReturnItemsTable.saleReturnID, saleReturnID),
      with: {
        product: {
          columns: {
            id: true,
            name: true,
          },
          with: {
            unit: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
        batch: {
          columns: {
            id: true,
            serial: true,
          },
          with: {
            variant: {
              columns: {
                id: true,
                name: true,
                attributes: true,
              },
            },
          },
        },
      },
    });

    return { saleReturn, products: items };
  }
}
