import { count, desc, eq, ilike } from "drizzle-orm";
import db from "../../drizzle/src";
import { unitTable } from "./unit.table";
import { CreateUnitInput } from "./unit.type";

export default class UnitRepository {
    static async create(payload: CreateUnitInput) {
        return await db.insert(unitTable).values(payload).returning();
    }

    static async findByName(name: string) {
        const result = await db
            .select()
            .from(unitTable)
            .where(eq(unitTable.name, name.trim().toLowerCase()));

        return result[0] || null;
    }
    static async findByID(unitID: any) {
        const result = await db.select().from(unitTable).where(eq(unitTable.id, unitID));
        return result;
    }

    static async delete(unitID: number) {
        return await db.delete(unitTable).where(eq(unitTable.id, unitID));
    }

    static async update(unitID: number, payload: CreateUnitInput) {
        return await db.update(unitTable).set(payload).where(eq(unitTable.id, unitID)).returning();
    }

static async list() {
  return await db
    .select()
    .from(unitTable)
    .orderBy(desc(unitTable.createdAt));
}
}