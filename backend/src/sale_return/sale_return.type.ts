import z from "zod";
import {
  createSaleReturnSchema,
  saleReturnSchema,
} from "./sale_return.validator";
import {
  saleReturnItemsTable,
  saleReturnTable,
} from "./sale_return.table";

export type SaleReturn = typeof saleReturnTable.$inferSelect;

export type OnlySaleReturnPayload = z.infer<typeof saleReturnSchema>;

export type CreateSaleReturnInput = z.infer<typeof createSaleReturnSchema>;

export type SaleReturnItemPayload =
  typeof saleReturnItemsTable.$inferInsert;

export type SaleReturnItem = typeof saleReturnItemsTable.$inferSelect;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
