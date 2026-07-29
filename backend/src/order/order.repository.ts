import { count, desc, eq, ilike } from "drizzle-orm";
import db from "../../drizzle/src";
import { orderTable, orderItemTable } from "./order.table";
import { variantTable } from "../product/variant.table";
import { OrderPayload, OrderItemPayload } from "./order.type";
import { QueryClient } from "../../drizzle/src";
import { paginateQuery } from "../../utils/queryBuilder";

// ─── Order Repository ──────────────────────────────────────────────────────

export class OrderRepository {
    static async createOrder(payload: OrderPayload, client: QueryClient = db) {
        const [order] = await client.insert(orderTable).values(payload).returning();
        return order;
    }

    static async createOrderItem(payload: OrderItemPayload, client: QueryClient = db) {
        const [item] = await client.insert(orderItemTable).values(payload).returning();
        return item;
    }

    static async findOrderByOrderNo(orderNo: string, client: QueryClient = db) {
        const result = await client.query.orderTable.findFirst({
            where: eq(orderTable.orderNo, orderNo),
            with: {
                items: true,
                user: {
                    columns: { id: true, name: true, email: true },
                },
            },
        });
        return result || null;
    }

    static async findOrderByStripeSessionID(stripeSessionID: string, client: QueryClient = db) {
        const result = await client.query.orderTable.findFirst({
            where: eq(orderTable.stripeSessionID, stripeSessionID),
            with: { items: true },
        });
        return result || null;
    }

    static async findOrderByStripePaymentIntent(stripePaymentIntent: string, client: QueryClient = db) {
        const result = await client.query.orderTable.findFirst({
            where: eq(orderTable.stripePaymentIntent, stripePaymentIntent),
            with: { items: true },
        });
        return result || null;
    }

    static async updateOrder(orderNo: string, data: Partial<typeof orderTable.$inferInsert>, client: QueryClient = db) {
        const [updated] = await client
            .update(orderTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(orderTable.orderNo, orderNo))
            .returning();
        return updated;
    }

    static async updateOrderByID(id: number, data: Partial<typeof orderTable.$inferInsert>, client: QueryClient = db) {
        const [updated] = await client
            .update(orderTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(orderTable.id, id))
            .returning();
        return updated;
    }

    static async deleteOrder(orderNo: string, client: QueryClient = db) {
        return await client.delete(orderTable).where(eq(orderTable.orderNo, orderNo));
    }

    static async deleteOrderItems(orderID: number, client: QueryClient = db) {
        return await client.delete(orderItemTable).where(eq(orderItemTable.orderID, orderID));
    }

    static async findVariantByID(variantID: number, client: QueryClient = db) {
        const result = await client.select().from(variantTable).where(eq(variantTable.id, variantID)).limit(1);
        return result[0] || null;
    }

    static async listOrdersByUser(userID: string, page = 1, limit = 10) {

        const whereClause = eq(orderTable.userID, userID);

        const result = await paginateQuery({
            query: db.query.orderTable,
            countTable: orderTable,
            where: [whereClause],
            page: page,
            limit: limit,
            orderBy: (table: any) => [desc(table.createdAt)],
        });


        return result
    }

    static async allOrders(page = 1, limit = 10, search?: string, client: QueryClient = db) {

        const result = await paginateQuery({
            query: db.query.orderTable,
            countTable: orderTable,
            search,
            searchColumns: [
                orderTable.orderNo
            ],
            page: page,
            limit: limit,
            orderBy: (table: any) => [desc(table.createdAt), desc(table.updatedAt)],
        });


        return result
    }

    static async findOrderItemsByOrderID(orderID: number, client: QueryClient = db) {
        return await client.select().from(orderItemTable).where(eq(orderItemTable.orderID, orderID));
    }

    static async generateOrderNo(): Promise<string> {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
        const prefix = `ORD-${dateStr}-`;

        const [lastOrder] = await db
            .select({ orderNo: orderTable.orderNo })
            .from(orderTable)
            .where(ilike(orderTable.orderNo, `${prefix}%`))
            .orderBy(desc(orderTable.orderNo))
            .limit(1);

        let seq = 1;
        if (lastOrder) {
            const lastSeq = parseInt(lastOrder.orderNo.split("-")[2] || "0", 10);
            seq = lastSeq + 1;
        }

        return `${prefix}${String(seq).padStart(6, "0")}`;
    }
}
