import { eq, and, gte, lte, sql } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";
import { dashboardSummaryTable } from "./dashboard.table";

export default class DashboardRepository {
    static async findByDate(date: string, client: QueryClient = db) {
        const [existing] = await client
            .select()
            .from(dashboardSummaryTable)
            .where(eq(dashboardSummaryTable.date, date))
            .limit(1);

        return existing || null;
    }

    static async create(data: typeof dashboardSummaryTable.$inferInsert, client: QueryClient = db) {
        const [created] = await client
            .insert(dashboardSummaryTable)
            .values(data)
            .returning();

        return created;
    }

    static async updateByDate(date: string, data: Partial<typeof dashboardSummaryTable.$inferInsert>, client: QueryClient = db) {
        return await client
            .update(dashboardSummaryTable)
            .set(data)
            .where(eq(dashboardSummaryTable.date, date));
    }

    static async incrementByDate(date: string, fields: Record<string, number>, client: QueryClient = db) {
        const setFields: Record<string, any> = { updatedAt: new Date() };

        for (const [key, value] of Object.entries(fields)) {
            const column = (dashboardSummaryTable as any)[key];
            if (column) {
                setFields[key] = sql`${column} + ${value}`;
            }
        }

        return await client
            .update(dashboardSummaryTable)
            .set(setFields)
            .where(eq(dashboardSummaryTable.date, date));
    }

    static async findRange(fromDate: string, toDate: string, client: QueryClient = db) {
        return await client
            .select()
            .from(dashboardSummaryTable)
            .where(
                and(
                    gte(dashboardSummaryTable.date, fromDate),
                    lte(dashboardSummaryTable.date, toDate)
                )
            )
            .orderBy(dashboardSummaryTable.date);
    }
}
