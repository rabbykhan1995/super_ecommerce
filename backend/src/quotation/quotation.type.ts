import z from "zod";
import { createSaleQuotationSchema } from "./quotation.validator";
import { saleQuotationItemsTable, saleQuotationTable } from "./quotation.table";

export type QuotationStatus = "pending" | "approved" | "cancelled";

export type SaleQuotation = typeof saleQuotationTable.$inferSelect;

export type SaleQuotationItem = typeof saleQuotationItemsTable.$inferSelect;

export type SaleQuotationItemPayload = typeof saleQuotationItemsTable.$inferInsert;

export type SaleQuotationPayload = typeof saleQuotationTable.$inferInsert;

export type CreateSaleQuotationInput = z.infer<
  typeof createSaleQuotationSchema
>;
