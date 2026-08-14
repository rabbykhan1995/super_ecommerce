import { count, desc, eq, SQL } from "drizzle-orm";
import db from "../../drizzle/src";
import { orderTable, orderItemTable } from "./order.table";
import { variantTable } from "../product/variant.table";
import { OrderPayload, OrderItemPayload, OrderStatus } from "./order.type";
import { QueryClient } from "../../drizzle/src";
import { paginateQuery } from "../../utils/queryBuilder";

export class OrderRepository {
    static async createOrder(payload: OrderPayload, client: QueryClient = db) {
        const [order] = await client.insert(orderTable).values(payload).returning();
        return order;
    }

    static async createOrderItem(payload: OrderItemPayload, client: QueryClient = db) {
        const [item] = await client.insert(orderItemTable).values(payload).returning();
        return item;
    }

    static async findOrderByID(id: number, client: QueryClient = db) {
        const result = await client.query.orderTable.findFirst({
            where: eq(orderTable.id, id),
            with: {
                items: true,
                contact: {
                    columns: { id: true, name: true, email: true },
                },
            },
        });
        return result || null;
    }

        static async findOrderForPublic(id: number, client: QueryClient = db) {
        const result = await client.query.orderTable.findFirst({
            where: eq(orderTable.id, id),
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

    static async updateOrderByID(id: number, data: Partial<typeof orderTable.$inferInsert>, client: QueryClient = db) {
        const [updated] = await client
            .update(orderTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(orderTable.id, id))
            .returning();
        return updated;
    }

    static async deleteOrderByID(id: number, client: QueryClient = db) {
        return await client.delete(orderTable).where(eq(orderTable.id, id));
    }

    static async deleteOrderItems(orderID: number, client: QueryClient = db) {
        return await client.delete(orderItemTable).where(eq(orderItemTable.orderID, orderID));
    }

    static async findVariantByID(variantID: number, client: QueryClient = db) {
        const result = await client.select().from(variantTable).where(eq(variantTable.id, variantID)).limit(1);
        return result[0] || null;
    }

    static async listOrdersByUser(contactID: number, page = 1, limit = 10) {
        const whereClause = eq(orderTable.contactID, contactID);

        const result = await paginateQuery({
            query: db.query.orderTable,
            countTable: orderTable,
            where: [whereClause],
            page: page,
            limit: limit,
            orderBy: (table: any) => [desc(table.createdAt)],
        });

        return result;
    }

    static async allOrders(page = 1, limit = 10, status?:OrderStatus , client: QueryClient = db) {
        const where: SQL[] = [];
        if (status) {
            where.push(eq(orderTable.status, status));
        }

        const result = await paginateQuery({
            query: db.query.orderTable,
            countTable: orderTable,
            page: page,
            limit: limit,
            where,
            with: {
                contact: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                        mobile: true,
                        balance: true,
                    },
                },
            },
            orderBy: (table: any) => [desc(table.createdAt), desc(table.updatedAt)],
        });

        return result;
    }

    static async findOrderItemsByOrderID(orderID: number, client: QueryClient = db) {
        return await client.select().from(orderItemTable).where(eq(orderItemTable.orderID, orderID));
    }
}
