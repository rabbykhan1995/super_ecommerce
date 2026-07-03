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
import { eq } from "drizzle-orm";
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
      .where(eq(purchaseReturnTable.id, returnID))
      .limit(1);

    return purchaseReturn;
  }

  static async deletePurchaseReturnByID(
    purchaseID: number,
    client: QueryClient = db,
  ) {
    const deleted = await client
      .delete(purchaseReturnTable)
      .where(eq(purchaseReturnTable.id, purchaseID));

    return deleted;
  }

  static async list(query: { page?: number; limit?: number; search?: string }) {
    return paginateQuery({
      query: db.query.purchaseReturnTable,
      countTable: purchaseReturnTable,
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
    return client
      .select()
      .from(purchaseReturnItemsTable)
      .where(eq(purchaseReturnItemsTable.purchaseReturnID, returnID));
  }
}
