import mongoose, { Types } from "mongoose";
import { ISale } from "./sale.type";

const saleSchema = new mongoose.Schema<ISale>(
  {
    SaleDate: {
      type: Date,
      default: Date.now
    },
    invoiceNo: {
      type: String,
      trim: true,
      lowercase: true,
    },
    customerID: {
      type: Types.ObjectId,
      ref: "Contact",
      default: null,
    },
    note: {
      type: String,
      default: null,
    },
    costName: {
      type: String,
      default: null,
    },
    exchangeAmount: { type: Number, default: 0 },
    deletable: { type: Boolean, default: true },
    totalProductPrice: { type: Number, default: 0 },    // qty × price
    otherCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },   // totalPrice + otherCost - discount
    paid: { type: Number, default: 0 },          // এই purchase এ কত দিলো
    // snapshot হিসেবে রাখো
    balanceBefore: { type: Number, default: 0 }, // purchase এর আগে supplier balance কত ছিল
    balanceAfter: { type: Number, default: 0 },
    accounts: [
      {
        _id: false,
        accountID: { type: Types.ObjectId, ref: "Account" },
        amount: { type: Number },
      }
    ],
    exchangeAccounts: [
      {
        _id: false,
        accountID: { type: Types.ObjectId, ref: "Account" },
        amount: { type: Number },
      }
    ],
    products: [
      {
        _id: false,
        productID: { type: Types.ObjectId, ref: "Product" },
        batchID: { type: Types.ObjectId, ref: "Batch" },
        soldQty: { type: Number, default: 0 },
        salePrice: { type: Number, default: 0 },
        warranty: { type: Number, default: 0 },

      }
    ],
  }, { timestamps: true }
);


saleSchema.index({ customerID: 1 });

saleSchema.index({ invoiceNo: 1 });

const Sale = mongoose.model<ISale>("Sale", saleSchema);

export default Sale;

// (productprice + othercost)-discount = totalAmount;
// totalAmount + balanceBefore = (200 + -100 ) = 100 to be paid. (200 + 100) = 300 to be paid..
// payable = totalAmount + balanceBefore;
// advancePaid = payable < paid; supplier balance is -50;
// due = payable > paid;
// balanceAfter = due;
