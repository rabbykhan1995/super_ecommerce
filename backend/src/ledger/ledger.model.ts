import mongoose, { Types } from "mongoose";
import { ILedger } from "./ledger.type";
const ledgerSchema = new mongoose.Schema<ILedger>(
  {
    type: {
      type: String,
      required: true,
      enum: ["sale", "purchase", "payment_in", "payment_out", "sale_return", "purchase_return"],
    },
    typeID: {
      type: Types.ObjectId,
      refPath: "typeModel",
    },
    typeModel: {
      type: String,
      enum: ["Sale", "Purchase", "Transaction"],
    },
    contactID: {
      type: Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    contactType: {
      type: String,
      enum: ["customer", "supplier"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    balanceAfter: {
      type: Number,
      default: 0
    },
    balanceBefore: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);
ledgerSchema.index({ contactID: 1,date: -1  });
ledgerSchema.index({typeID:1,date: -1 });


const Ledger = mongoose.model<ILedger>("Ledger", ledgerSchema);

export default Ledger;
