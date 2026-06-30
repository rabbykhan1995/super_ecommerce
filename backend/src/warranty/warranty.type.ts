import { Document, HydratedDocument, Types } from "mongoose";
import { warrantyTable } from "./warranty.table";

export type Warranty = typeof warrantyTable.$inferSelect;

export type WarrantyPayload = typeof warrantyTable.$inferInsert;

export type WarrantyStatus =
    | "sold"
    | "claimed"
    | "sent_to_supplier"
    | "received_from_supplier"
    | "repaired"
    | "replaced"                // supplier replaced করেছে
    | "rejected"
    | "returned_to_customer"
    | "refunded";
