import mongoose, { Types } from "mongoose";
import { IPurchase } from "./purchase.type";

const purchaseSchema = new mongoose.Schema<IPurchase>(
  {
    PurchaseDate: {
      type: Date,
      default: Date.now
    },
    invoiceNo: {
      type: String,
      trim: true,
      lowercase: true,
    },
    supplierID: {
      type: Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    note: {
      type: String,
      default: null,
    },
    costName: {
      type: String,
      default: null,
    },
    deletable: { type: Boolean, default: true },
    totalProductPrice: { type: Number, default: 0 },    // qty × price
    otherCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },   // totalPrice + otherCost - discount
    paid: { type: Number, default: 0 },          // এই purchase এ কত দিলো
    // snapshot হিসেবে রাখো
    exchangeAmount: { type: Number, default: 0 },
    balanceBefore: { type: Number, default: 0 }, // purchase এর আগে supplier balance কত ছিল
    balanceAfter: { type: Number, default: 0 },
    accounts: [
      {
        _id: false,
        accountID: { type: Types.ObjectId, ref: "Account" },
        amount: { type: Number },
      }
    ],
  }, { timestamps: true }
);


purchaseSchema.index({ supplierID: 1 });

purchaseSchema.index({ invoiceNo: 1 });

const Purchase = mongoose.model<IPurchase>("Purchase", purchaseSchema);

export default Purchase;

// (productprice + othercost)-discount = totalAmount;
// totalAmount + balanceBefore = (200 + -100 ) = 100 to be paid. (200 + 100) = 300 to be paid..
// payable = totalAmount + balanceBefore;
// advancePaid = payable < paid; supplier balance is -50;
// due = payable > paid;
// balanceAfter = due;
