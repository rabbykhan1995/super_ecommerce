import mongoose, { Types } from "mongoose";
import { ITransaction, Transaction_TYPE_MODELS, TRANSACTION_TYPES } from "./transaction.type";
// this is final, no thing to update
const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
    },
    typeID: {
      type: Types.ObjectId,
      refPath: "typeModel",
    },
    typeModel: {
      type: String,
      enum: Transaction_TYPE_MODELS,
    },
    contactID:{
      type:Types.ObjectId,
      ref:"Contact"
    },
      groupID:{
      type:Types.ObjectId,
      default:null
    },
    amount: {
      type: Number,
      required: true,
    },
    fromAccount: {
      type: Types.ObjectId,
      ref: "Account",
    },
    toAccount: {
      type: Types.ObjectId,
      ref: "Account",
    },
    note: String,
    date: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
  }, { timestamps: true }
);
transactionSchema.index({ fromAccount: 1, date: -1 });
transactionSchema.index({ toAccount: 1, date: -1 });
transactionSchema.index({ typeID: 1 });
transactionSchema.index({ contactID: 1 });
transactionSchema.index({ groupID: 1 });

const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);

export default Transaction;
