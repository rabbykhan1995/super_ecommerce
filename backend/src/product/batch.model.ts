import mongoose, { Types } from "mongoose";
import { IBatch } from "./product.type";
// this is final, no thing to update
const batchSchema = new mongoose.Schema<IBatch>(
  {
    serial: {
      type: String,
      trim: true,
      lowercase: true,
    },
    warranty: {
      type: Number,
      default: 0
    },
    productID: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    purchaseID: {
      type: Types.ObjectId,
      ref: "Purchase",
      default: null,
    },

    purchasedQty: {
      type: Number,
      default: 0,
    },
    soldQty: {
      type: Number,
      default: 0,
    },
    remainingQty: {
      type: Number,
    },
    purchaseReturnedQty: {
      type: Number,
      default: 0,
    },
    saleReturnedQty: {
      type: Number,
      default: 0,
    },
    purchasePrice: {
      type: Number,
      default: 0,
    },
    salePrice: {
      type: Number,
      default: 0,
    },
    PurchaseDate: {
      type: Date,
      default: Date.now
    },
    expireDate: {
      type: Date,
      default: null
    },
    isActive: { type: Boolean, default: true },
    damagedQty: { type: Number, default: 0 },
  }, { timestamps: true }
);


batchSchema.index(
  { serial: 1 },
  {
    unique: true,
    partialFilterExpression: { serial: { $type: "string", $gt: "" } },
  }
);

batchSchema.index({ productID: 1 });
batchSchema.index({ purchaseID: 1 });

const Batch = mongoose.model<IBatch>("Batch", batchSchema);

export default Batch;
