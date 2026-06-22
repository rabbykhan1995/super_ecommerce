import mongoose, { Types } from "mongoose";
import { IPurchaseReturn } from "./purchase_return.type";

const purchaseReturnSchema = new mongoose.Schema<IPurchaseReturn>({
    purchaseID: { type: Types.ObjectId, ref: "Purchase", required: true },
    supplierID: { type: Types.ObjectId, ref: "Contact", required: true},
    note: String,
    totalAmount: { type: Number, required: true },
    paid: { type: Number, default: 0 },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    accounts: [{
        accountID: { type: Types.ObjectId, ref: "Account" },
        amount: Number,
    }],
    batches: [{
        batchID: { type: Types.ObjectId, ref: "Batch" },
        productID: { type: Types.ObjectId, ref: "Product" },
        purchaseReturnedQty: Number,
        purchasePrice: Number,
        reason: String,
    }],
    date: { type: Date, default: Date.now },
}, { timestamps: true });

purchaseReturnSchema.index({ purchaseID: 1 });
purchaseReturnSchema.index({ supplierID: 1, date: -1 });

const PurchaseReturn = mongoose.model<IPurchaseReturn>("PurchaseReturn", purchaseReturnSchema);

export default PurchaseReturn;

// (productprice + othercost)-discount = totalAmount;
// totalAmount + balanceBefore = (200 + -100 ) = 100 to be paid. (200 + 100) = 300 to be paid..
// payable = totalAmount + balanceBefore;
// advancePaid = payable < paid; supplier balance is -50;
// due = payable > paid;
// balanceAfter = due;
