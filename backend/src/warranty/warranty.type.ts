import { warrantyTable } from "./warranty.table";

export type Warranty = typeof warrantyTable.$inferSelect;

export type WarrantyPayload = typeof warrantyTable.$inferInsert;

export type WarrantyResponse = Warranty;

export type WarrantyStatus =
    | "sold"
    | "claimed"
    | "sent_to_supplier"
    | "received_from_supplier"
    | "repaired"
    | "replaced"
    | "rejected"
    | "returned_to_customer"
    | "refunded";
