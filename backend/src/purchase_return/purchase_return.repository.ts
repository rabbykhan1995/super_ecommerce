import {
  OnlyPurchaseReturnPayload,
  PurchaseReturn,
  PurchaseReturnItem,
  PurchaseReturnItemPayload,
} from "./purchase_return.type";
import { paginateQuery } from "../../utils/queryBuilder";
import {
  purchaseReturnItemsTable,
  purchaseReturnTable,
} from "./purchase_return.table";
import { and, eq, ne, count } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";

export default class PurchaseReturnRepository {
  static async purchaseReturnCreate(
    payload: OnlyPurchaseReturnPayload,
    client: QueryClient = db,
  ): Promise<PurchaseReturn> {
    const [purchase] = await client
      .insert(purchaseReturnTable)
      .values(payload)
      .returning();

    return purchase;
  }

  static async purchaseReturnItemCreate(
    payload: PurchaseReturnItemPayload,
    client: QueryClient = db,
  ): Promise<PurchaseReturnItem> {
    const [item] = await client
      .insert(purchaseReturnItemsTable)
      .values(payload)
      .returning();

    return item;
  }

  static async findByID(
    returnID: number,
    client: QueryClient = db,
  ): Promise<PurchaseReturn> {
    const [purchaseReturn] = await client
      .select()
      .from(purchaseReturnTable)
      .where(and(eq(purchaseReturnTable.id, returnID), eq(purchaseReturnTable.isDeleted, false)))
      .limit(1);

    return purchaseReturn;
  }

  static async findByIDRaw(
    returnID: number,
    client: QueryClient = db,
  ): Promise<PurchaseReturn> {
    const [purchaseReturn] = await client
      .select()
      .from(purchaseReturnTable)
      .where(eq(purchaseReturnTable.id, returnID))
      .limit(1);

    return purchaseReturn;
  }

  static async softDelete(returnID: number, client: QueryClient = db) {
    const [purchaseReturn] = await client
      .update(purchaseReturnTable)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(eq(purchaseReturnTable.id, returnID))
      .returning();

    return purchaseReturn ?? null;
  }

  static async restore(returnID: number, client: QueryClient = db) {
    const [purchaseReturn] = await client
      .update(purchaseReturnTable)
      .set({ isDeleted: false, deletedAt: null })
      .where(eq(purchaseReturnTable.id, returnID))
      .returning();

    return purchaseReturn ?? null;
  }

  static async list(query: { page?: number; limit?: number; search?: string }) {
    return paginateQuery({
      query: db.query.purchaseReturnTable,
      countTable: purchaseReturnTable,
      where: [eq(purchaseReturnTable.isDeleted, false)],
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }

  static async purchaseReturnUpdateDynamic(
    purchaseID: number,
    data: Partial<typeof purchaseReturnTable.$inferInsert>,
    client: QueryClient = db,
  ) {
    const [updated] = await client
      .update(purchaseReturnTable)
      .set(data)
      .where(eq(purchaseReturnTable.id, purchaseID))
      .returning();

    return updated;
  }

static async itemsByPurchaseReturnID(
  returnID: number,
  client: QueryClient = db,
) {
  return client.query.purchaseReturnItemsTable.findMany({
    where: (items, { eq }) => eq(items.purchaseReturnID, returnID),
  });
}

static async countOtherPurchaseReturns(
  purchaseID: number,
  excludeReturnID: number,
  client: QueryClient = db,
): Promise<number> {
  const [totalAll] = await client
    .select({ total: count() })
    .from(purchaseReturnTable)
    .where(
      and(
        eq(purchaseReturnTable.purchaseID, purchaseID),
        eq(purchaseReturnTable.isDeleted, false),
        ne(purchaseReturnTable.id, excludeReturnID)
      )
    );

  return totalAll?.total ?? 0;
}


    static async getPurchaseReturnInvoice(
        purchaseReturnID: number,
        client: QueryClient = db
    ) {
        
        const purchaseReturn = await client.query.purchaseReturnTable.findFirst({
          where: and(eq(purchaseReturnTable.id, purchaseReturnID), eq(purchaseReturnTable.isDeleted, false)),
          with:{
            supplier:true
          }
        })
        
        const items = await client.query.purchaseReturnItemsTable.findMany({
            where: eq(purchaseReturnItemsTable.purchaseReturnID, purchaseReturnID),
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


       return {purchaseReturn, products:items }
    }

}
