import mongoose, { Types } from "mongoose";
import { ISaleReturn } from "./sale_return.type";

const saleReturnSchema = new mongoose.Schema<ISaleReturn>({
    saleID: { type: Types.ObjectId, ref: "Purchase", required: true },
    customerID: { type: Types.ObjectId, ref: "Contact", default:null},
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
        saleReturnedQty: Number,
        salePrice: Number,
        reason: String,
    }],
    date: { type: Date, default: Date.now },
}, { timestamps: true });

saleReturnSchema.index({ saleID: 1 });
saleReturnSchema.index({ customerID: 1, date: -1 });

const SaleReturn = mongoose.model<ISaleReturn>("SaleReturn", saleReturnSchema);

export default SaleReturn;

// (productprice + othercost)-discount = totalAmount;
// totalAmount + balanceBefore = (200 + -100 ) = 100 to be paid. (200 + 100) = 300 to be paid..
// payable = totalAmount + balanceBefore;
// advancePaid = payable < paid; supplier balance is -50;
// due = payable > paid;
// balanceAfter = due;
