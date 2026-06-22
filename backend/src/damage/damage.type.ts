import { Document, HydratedDocument, Types } from "mongoose";
import z from "zod";
import { createDamageSchema } from "./damage.validator";

// supplier k ami koto due rakhlam, naki ami supplier k advance dilam,amr perspective theke supplier, 
export interface IDamage extends Document {
    batchID?: Types.ObjectId;
    productID: Types.ObjectId;
    purchaseID?: Types.ObjectId;  // ✅ কোন purchase এর ছিল
    serial?: string | null;       // ✅ serial product হলে
    expireDate?: Date | null;     // ✅ কেন damage হলো বুঝতে
    damagedQty: number;
    damageLoss:number;
    purchasePrice: number;        // ✅ snapshot            // ✅ damagedQty * purchasePrice
    reason: "expired" | "manual"; // ✅ auto নাকি manually damage করা হয়েছে
    note?: string | null;
    DamageDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletable:boolean;
}


export type DamageResponse = HydratedDocument<IDamage>;

export type CreateDamageInput = z.infer<typeof createDamageSchema>;
// export type UpdateDamageInput = z.infer<typeof updateSaleSchema>;