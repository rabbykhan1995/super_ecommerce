import { Contact, ContactType } from "./contact.type";
import { paginateQuery } from "../../utils/queryBuilder";
import db, { QueryClient } from "../../drizzle/src";
import { contactTable } from "./contact.table";
import { and, eq, sql } from "drizzle-orm";

export default class ContactRepository {

    static async findByID(
        contactID: number,
        client: QueryClient = db
    ): Promise<Contact | null> {
        const [contact] = await client
            .select()
            .from(contactTable)
            .where(eq(contactTable.id, contactID))
            .limit(1);

        return contact ?? null;
    }
  static async findOne(
    where: Partial<{
      userID: string;
      email: string;
      mobile: string;
    }>,
    client: QueryClient = db,
  ) {
    const conditions = [];



    if (where.userID) {
      conditions.push(eq(contactTable.userID, where.userID));
    }

    if (where.email) {
      conditions.push(eq(contactTable.email, where.email));
    }

    if (where.mobile) {
      conditions.push(eq(contactTable.mobile, where.mobile));
    }

    if (conditions.length === 0) {
      throw new Error("At least one search field is required.");
    }

    const [contact] = await client
      .select()
      .from(contactTable)
      .where(and(...conditions));

    return contact ?? null;
  }
    static async findByMobile(
        mobile: string,
        client: QueryClient = db
    ): Promise<Contact | null> {
        const [contact] = await client
            .select()
            .from(contactTable)
            .where(eq(contactTable.mobile, mobile))
            .limit(1);

        return contact ?? null;
    }

    static async create(
        payload: any,
        client: QueryClient = db
    ): Promise<Contact | null> {
        const [contact] = await client
            .insert(contactTable)
            .values(payload)
            .returning();

        return contact ?? null;
    }

    static async findByIDAndUpdate(
        contactID: number,
        payload: Partial<Contact>,
        client: QueryClient = db
    ): Promise<Contact | null> {
        const [contact] = await client
            .update(contactTable)
            .set(payload)
            .where(eq(contactTable.id, contactID))
            .returning();

        return contact ?? null;
    }

    static async list(query: {
        page?: number;
        limit?: number;
        search?: string;
        type: ContactType;
    }) {

        return paginateQuery({
            query: db.query.contactTable,
            countTable: contactTable,
            searchColumns: [contactTable.mobile, contactTable.name],
            where: [
                ...(query.type === "customer" ? [eq(contactTable.type, query.type)] : []),
                ...(query.type === "supplier" ? [eq(contactTable.type, query.type)] : []),
            ],
            page: query.page,
            limit: query.limit,
            search: query.search,
        });
    }

    static async increaseBalance(
        contactID: number,
        amount: number,
        client: QueryClient = db
    ): Promise<Contact | null> {
        const [contact] = await client
            .update(contactTable)
            .set({
                balance: sql`${contactTable.balance} + ${amount}`,
            })
            .where(eq(contactTable.id, contactID))
            .returning();

        return contact ?? null;
    }

    static async decreaseBalance(
        contactID: number,
        amount: number,
        client: QueryClient = db
    ): Promise<Contact | null> {
        const [contact] = await client
            .update(contactTable)
            .set({
                balance: sql`${contactTable.balance} - ${amount}`,
            })
            .where(eq(contactTable.id, contactID))
            .returning();

        return contact ?? null;
    }

}