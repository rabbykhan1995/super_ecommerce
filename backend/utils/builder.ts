import { Types } from "mongoose";
import { CreateLedgerInput } from "../src/ledger/ledger.type";

export type TransactionPayloadItem = {
    groupID?: Types.ObjectId;

    type:
    | "sale"
    | "purchase"
    | "sale_return"
    | "purchase_return"
    | "deposit"
    | "withdraw"
    |"exchange";

    typeID?: Types.ObjectId;

    typeModel?: "Sale" | "Purchase" | "Transaction" | "SaleReturn"
    | "PurchaseReturn";

    fromAccount?: Types.ObjectId;

    toAccount?: Types.ObjectId;

    contactID?: Types.ObjectId;

    amount: number;

    note?: string;

    status?: string;

    date?: Date;
};


export type BatchPayloadItem = {
    productID: Types.ObjectId;

    purchaseID?: Types.ObjectId;

    serial?: string;

    purchasedQty: number;

    remainingQty?: number;

    purchasePrice: number;

    salePrice: number;

    PurchaseDate?: Date;

    warranty?: number;

    isActive?: boolean;
};

export default class PayloadBuilder {
    constructor() { }
    static ledger(config: CreateLedgerInput) {

        return {
            type: config.type,

            typeID: config.typeID,

            typeModel: config.typeModel,

            contactID: config.contactID,

            contactType: config.contactType,

            amount: config.amount,

            paidAmount: config.paidAmount ?? 0,

            dueAmount: config.dueAmount ?? 0,

            discount: config.discount ?? 0,

            note: config.note,

            balanceBefore: config.balanceBefore ?? 0,

            balanceAfter: config.balanceAfter ?? 0,

            date: config.date ?? new Date(),
        };
    }

    static batch(
        products: any[],
        config: {
            purchaseID?: any;
            purchaseDate?: Date;
            isActive?: boolean;
        }
    ): BatchPayloadItem[] {

        return products.map((p) => ({
            productID: p.productID,

            ...(config?.purchaseID && {
                purchaseID: config.purchaseID,
            }),

            serial: p.serial,

            purchasedQty: p.purchasedQty,

            remainingQty: p.purchasedQty,

            purchasePrice: p.purchasePrice,

            salePrice: p.salePrice,

            PurchaseDate:
                config.purchaseDate || new Date(),

            ...(p.warranty && {
                warranty: p.warranty,
            }),

            isActive: config.isActive || true,
        }));
    }

    static transaction(
        accounts: any[],
        config: {
            groupID?: any;

            type:
            | "sale"
            | "purchase"
            | "sale_return"
            | "purchase_return"
            | "deposit"
            | "withdraw"
            | "exchange"
            | "expense";

            typeID?: any;

            typeModel?: "Sale" | "Purchase" | "Transaction" | "SaleReturn"
            | "PurchaseReturn" | "Expense";

            contactID?: any;

            accountField?: "fromAccount" | "toAccount";

            note?: string;

            status?: string;

            date?: Date;
        }
    ): TransactionPayloadItem[] {

        return accounts.map((acc) => ({

            ...(config.groupID && {
                groupID: config.groupID,
            }),

            type: config.type,

            typeID: config.typeID,

            typeModel: config.typeModel,

            contactID: config.contactID,

            [config.accountField || "toAccount"]:
                acc.accountID,

            amount: acc.amount,

            note: config.note ?? "",

            status: config.status ?? "completed",

            date: config.date ?? new Date(),
        }));
    }

}