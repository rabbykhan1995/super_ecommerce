import db, { QueryClient } from "../../drizzle/src";
import { parcelTable } from "./parcel.table";
import { paginateQuery } from "../../utils/queryBuilder";
import { eq, and } from "drizzle-orm";
import { ParcelPayload } from "./parcel.type";

export default class ParcelRepository {
  static async create(
    payload: ParcelPayload,
    client: QueryClient = db
  ): Promise<any> {
    const [parcel] = await client
      .insert(parcelTable)
      .values(payload)
      .returning();

    return parcel;
  }

  static async findByID(
    id: number,
    client: QueryClient = db
  ) {
    return await client.query.parcelTable.findFirst({
      where: (parcel, { eq }) => eq(parcel.id, id),
      with: {
        sale: {
          columns: {
            id: true,
            invoiceNo: true,
            totalAmount: true,
            paid: true,
          },
        },
        customer: {
          columns: {
            id: true,
            name: true,
            mobile: true,
            address: true,
          },
        },
      },
    });
  }

  static async findBySaleID(
    saleID: number,
    client: QueryClient = db
  ) {
    const [parcel] = await client
      .select()
      .from(parcelTable)
      .where(eq(parcelTable.saleID, saleID))
      .limit(1);

    return parcel ?? null;
  }

  static async update(
    id: number,
    data: Partial<typeof parcelTable.$inferInsert>,
    client: QueryClient = db
  ) {
    const [updated] = await client
      .update(parcelTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(parcelTable.id, id))
      .returning();

    return updated;
  }

  static async delete(
    id: number,
    client: QueryClient = db
  ) {
    const [deleted] = await client
      .delete(parcelTable)
      .where(eq(parcelTable.id, id))
      .returning();

    return deleted ?? null;
  }

  static async list(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    return paginateQuery({
      query: db.query.parcelTable,
      countTable: parcelTable,
      searchColumns: [
        parcelTable.thirdPartyTrackingNo,
        parcelTable.localParcelNo,
        parcelTable.courierName,
      ],
      page: query.page,
      limit: query.limit,
      search: query.search,
      with: {
        sale: {
          columns: {
            id: true,
            invoiceNo: true,
            totalAmount: true,
            paid: true,
          },
        },
        customer: {
          columns: {
            id: true,
            name: true,
            mobile: true,
          },
        },
      },
      orderBy: (table: any) => [table.createdAt],
    });
  }
}
