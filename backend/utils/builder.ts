import { Types } from "mongoose";
import { CreateLedgerInput } from "../src/ledger/ledger.type";
import { TxSource, TxType } from "../src/transaction/transaction.type";
import Transaction from "../src/transaction/transaction.model";
import { AccBalancePayload } from "../src/account/account.type";
import { txSourceEnum, txTypeEnum } from "../src/transaction/transaction.table";


export type BatchPayloadItem = {
    productID: Types.ObjectId;

    purchaseID?: Types.ObjectId;

    serial?: string;

    purchasedQty: number;

    variantID:number;

    remainingQty?: number;

    purchasePrice: number;

    salePrice: number;

    PurchaseDate?: Date;

    warranty?: number;

    isActive?: boolean;
};

export type trxConfig = {
    source: TxSource;
    type: TxType;
    date: Date;
    purchaseID?: number;
    saleID?: number;
    purchaseReturnID?: number;
    saleReturnID?: number;
    balanceTransferID?: number;
    warrantyID?: number;
}

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


    static transaction(account: AccBalancePayload,config:trxConfig) {
       return ({...account, ...config})
    }



}