import z from "zod";
import { createSaleReturnSchema } from "./sale_return.validator";
import { saleReturnTable } from "./sale_return.table";

// supplier k ami koto due rakhlam, naki ami supplier k advance dilam,amr perspective theke supplier, 
export type SaleReturn = typeof saleReturnTable.$inferSelect;

export type CreateSaleReturnInput = z.infer<typeof createSaleReturnSchema>;
// export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;

