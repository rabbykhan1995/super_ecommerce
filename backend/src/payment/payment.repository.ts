import { eq, and } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";
import { paymentTable } from "./payment.table";
import { contactTable } from "../contact/contact.table";
import { transactionTable } from "../transaction/transaction.table";
import { accountTable } from "../account/account.table";
import { PaymentPayload } from "./payment.type";
import { paginateQuery } from "../../utils/queryBuilder";
import { desc } from "drizzle-orm";

export default class PaymentRepository {
  constructor() {}

  static async create(
    payload: PaymentPayload,
    client: QueryClient = db
  ) {
    const [payment] = await client
      .insert(paymentTable)
      .values(payload)
      .returning();

    return payment ?? null;
  }

  static async findByID(id: number, client: QueryClient = db) {
    const [payment] = await client
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.id, id))
      .limit(1);

    if (!payment) return null;

    const [contact] = await client
      .select({ id: contactTable.id, name: contactTable.name, mobile: contactTable.mobile, address: contactTable.address, balance: contactTable.balance })
      .from(contactTable)
      .where(eq(contactTable.id, payment.contactID))
      .limit(1);

    const transactions = await client
      .select({
        id: transactionTable.id,
        amount: transactionTable.amount,
        type: transactionTable.type,
        date: transactionTable.date,
        accountID: accountTable.id,
        accountName: accountTable.name,
      })
      .from(transactionTable)
      .leftJoin(accountTable, eq(transactionTable.accountID, accountTable.id))
      .where(eq(transactionTable.paymentID, payment.id));

    return {
      ...payment,
      contact: contact ?? null,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        date: tx.date,
        account: { id: tx.accountID, name: tx.accountName },
      })),
    };
  }

  static async list(query: {
    page?: number;
    limit?: number;
    search?: string;
    contactID?: number;
    type?: string;
  }) {
    return paginateQuery({
      query: db.query.paymentTable,
      countTable: paymentTable,
      searchColumns: [paymentTable.note],
      where: [
        ...(query.contactID ? [eq(paymentTable.contactID, query.contactID)] : []),
        ...(query.type ? [eq(paymentTable.type, query.type as any)] : []),
      ],
      page: query.page,
      limit: query.limit,
      search: query.search,
      orderBy: desc(paymentTable.id),
      with: {
        contact: {
          columns: {
            id: true,
            name: true,
            mobile: true,
            balance: true,
          },
        },
      },
    });
  }
}
