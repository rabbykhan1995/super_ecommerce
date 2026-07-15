import { Damage, DamagePayload } from "./damage.type";
import db, { QueryClient } from "../../drizzle/src";
import { damageTable } from "./damage.table";
import { paginateQuery } from "../../utils/queryBuilder";
import { eq } from "drizzle-orm";


export default class DamageRepository {
    static async create(
        payload: DamagePayload,
        client: QueryClient = db,
    ): Promise<Damage> {
         const [damage] =  await client
            .insert(damageTable)
            .values(payload)
            .returning();

            return damage;
    }

    static async list(query: Record<string, any>) {
        return paginateQuery({
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 10,

            query: db.query.damageTable,

            countTable: damageTable,

            search: query.search,

            searchColumns: [
                damageTable.reason,
                damageTable.note,
            ],

            with: {
                product: {
                    columns: {
                        id: true,
                        name: true,
                    },
                },

                batch: {
                    columns: {
                        id: true,
                        batchNo: true,
                        serial: true,
                    },
                },

                variant: {
                    columns: {
                        id: true,
                        attributes: true,
                    },
                },
            },
        });
    }

    static async delete(
        id: number,
        client: QueryClient = db,
    ): Promise<Damage | null> {
        const [damage] = await client
            .delete(damageTable)
            .where(eq(damageTable.id, id))
            .returning();

        return damage ?? null;
    }
    static async findByID(
        id: number,
        client: QueryClient = db,
    ) {
        return await client.query.damageTable.findFirst({
            where: (damage, { eq }) => eq(damage.id, id),

            with: {
                product: true,
                batch: true,
                purchase: true,
                variant: true,
            },
        });
    }
}