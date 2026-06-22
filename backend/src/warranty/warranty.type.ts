import { Document, HydratedDocument, Types } from "mongoose";

export interface IWarranty extends Document {
    customerID: Types.ObjectId | null;
    saleID: Types.ObjectId;
    productID: Types.ObjectId;
    serial: string;
    batchID: Types.ObjectId;
    salePrice: number;
    warranty: number;
    status: WarrantyStatus;
    supplierAction?:WarrantyStatus;
    active: boolean;
    note?: string;
    replacedSerial?: string;
    expireDate: Date | null;
    claimDate: Date | null;
    issueDescription?: string;
    supplierID: Types.ObjectId;
    saleDate: Date | null;
    sentDate: Date | null;
    receivedDate: Date | null;
    resolvedDate: Date | null;
    supplierNote?: string;
    replacedBatchID?: Types.ObjectId;
    refundAmount: number;
    otherCost: number;
    accounts: { accountID: Types.ObjectId, amount: number }[],
}

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


export type WarrantyResponse = HydratedDocument<IWarranty>;