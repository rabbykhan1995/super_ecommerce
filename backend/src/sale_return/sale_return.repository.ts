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
import { saleItemsTable } from "../sale/sale_items.table";
import { and, count, eq, ne, sum } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";

type SaleItemWithRelations = {
  id: number;
  saleID: number;
  productID: number;
  variantID: number;
  batchID: number;
  soldQty: number;
  salePrice: number;
  warranty: number;
  product: {
    id: number;
    name: string;
    manageStock: boolean;
    manageWarranty: boolean;
    stock: number;
    unit: {
      id: number;
      name: string;
    };
  };
  batch: {
    id: number;
    serial: string | null;
    variant: {
      id: number;
      attributes: { name: string; value: string }[];
    };
  };
};

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
      .where(and(eq(saleReturnTable.id, returnID), eq(saleReturnTable.isDeleted, false)))
      .limit(1);

    return saleReturn;
  }

  static async findByIDRaw(
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

  static async softDelete(returnID: number, client: QueryClient = db) {
    const [saleReturn] = await client
      .update(saleReturnTable)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(eq(saleReturnTable.id, returnID))
      .returning();

    return saleReturn ?? null;
  }

  static async restore(returnID: number, client: QueryClient = db) {
    const [saleReturn] = await client
      .update(saleReturnTable)
      .set({ isDeleted: false, deletedAt: null })
      .where(eq(saleReturnTable.id, returnID))
      .returning();

    return saleReturn ?? null;
  }

  static async list(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    return paginateQuery({
      query: db.query.saleReturnTable,
      countTable: saleReturnTable,
      where: [eq(saleReturnTable.isDeleted, false)],
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
      .where(
        and(
          eq(saleReturnTable.saleID, saleID),
          eq(saleReturnTable.isDeleted, false),
          ne(saleReturnTable.id, excludeReturnID)
        )
      );

    return totalAll?.total ?? 0;
  }

  static async getSaleReturnInvoice(
    saleReturnID: number,
    client: QueryClient = db,
  ) {
    const saleReturn = await client.query.saleReturnTable.findFirst({
      where: and(eq(saleReturnTable.id, saleReturnID), eq(saleReturnTable.isDeleted, false)),
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
                attributes: true,
              },
            },
          },
        },
      },
    });

    return { saleReturn, products: items };
  }

  static async getSaleItemsBySaleID(
    saleID: number,
    client: QueryClient = db,
  ): Promise<SaleItemWithRelations[]> {
    return client.query.saleItemsTable.findMany({
      where: eq(saleItemsTable.saleID, saleID),
      with: {
        product: {
          columns: {
            id: true,
            name: true,
            manageStock: true,
            manageWarranty: true,
            stock: true,
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
                attributes: true,
              },
            },
          },
        },
      },
    });
  }

  static async getReturnedQtyBySaleID(
    saleID: number,
    client: QueryClient = db,
  ) {
    return client
      .select({
        batchID: saleReturnItemsTable.batchID,
        totalReturned: sum(saleReturnItemsTable.saleReturnedQty),
      })
      .from(saleReturnItemsTable)
      .innerJoin(
        saleReturnTable,
        eq(saleReturnItemsTable.saleReturnID, saleReturnTable.id),
      )
      .where(eq(saleReturnTable.saleID, saleID))
      .groupBy(saleReturnItemsTable.batchID);
  }
}
