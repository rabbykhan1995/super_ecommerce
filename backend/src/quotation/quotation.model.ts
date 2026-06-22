import mongoose, { Types } from "mongoose";
import { ISaleQuotation, QuotationStatus } from "./quotation.type";

const saleQuotationSchema = new mongoose.Schema<ISaleQuotation>(
  {
    SaleDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "cancelled",
      ] satisfies QuotationStatus[],
      default: "pending",
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
    deletable: { type: Boolean, default: true },
    totalProductPrice: { type: Number, default: 0 },    // qty × price
    otherCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
        balanceBefore: { type: Number, default: 0 }, // purchase এর আগে supplier balance কত ছিল
    balanceAfter: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
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

const SaleQuotation = mongoose.model<ISaleQuotation>("SaleQuotation", saleQuotationSchema);

export default SaleQuotation;

