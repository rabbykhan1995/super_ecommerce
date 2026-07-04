
import z from "zod";
import { createDamageSchema } from "./damage.validator";
import { damageTable } from "./damage.table";

// supplier k ami koto due rakhlam, naki ami supplier k advance dilam,amr perspective theke supplier, 
export type Damage = typeof damageTable.$inferSelect;
export type DamagePayload = typeof damageTable.$inferInsert;

export type CreateDamageInput = z.infer<typeof createDamageSchema>;
// export type UpdateDamageInput = z.infer<typeof updateSaleSchema>;