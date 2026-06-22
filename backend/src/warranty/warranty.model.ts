import mongoose, { Types } from "mongoose";
import { IWarranty, WarrantyStatus } from "./warranty.type";


const warrantySchema = new mongoose.Schema<IWarranty>({
  saleID: { type: Types.ObjectId, ref: "Sale", required: true },
  customerID: { type: Types.ObjectId, ref: "Contact", default: null },
  productID: { type: Types.ObjectId, ref: "Product", required: true },
  batchID: { type: Types.ObjectId, ref: "Batch", required: true },
  serial: { type: String, default: null },
  salePrice: { type: Number, default: 0 },
  warranty: { type: Number, default: 0 },       // months
  saleDate: { type: Date, required: true },
  expireDate: { type: Date, default: null },     // saleDate + warranty months

  status: {
    type: String,
    enum: [
      "sold", "claimed", "sent_to_supplier",
      "received_from_supplier", "repaired", "replaced",
      "rejected",
      "returned_to_customer", "refunded",
    ] satisfies WarrantyStatus[],
    default: "sold",
  },
  supplierAction: {
    type: String,
    enum: [
      "repaired",
      "replaced",
      "rejected",
      "refunded",
      null,
    ],
    default: null,
  },

  // Claim
  claimDate: { type: Date, default: null },
  issueDescription: { type: String, default: null },

  // Supplier
  supplierID: { type: Types.ObjectId, ref: "Contact", default: null },
  sentDate: { type: Date, default: null },
  receivedDate: { type: Date, default: null },
  supplierNote: { type: String, default: null },

  // Replace
  replacedSerial: { type: String, default: null },
  replacedBatchID: { type: Types.ObjectId, ref: "Batch", default: null },

  // Refund / Other cost
  refundAmount: { type: Number, default: 0 },
  otherCost: { type: Number, default: 0 },
  accounts: [{
    _id: false,
    accountID: { type: Types.ObjectId, ref: "Account" },
    amount: { type: Number },
  }],

  resolvedDate: { type: Date, default: null },
  note: { type: String, default: null },

}, { timestamps: true });

warrantySchema.index({ saleID: 1 });
warrantySchema.index({ customerID: 1 });
warrantySchema.index({ serial: 1 });
warrantySchema.index({ status: 1 });
warrantySchema.index({ expireDate: 1 });

const Warranty = mongoose.model("Warranty", warrantySchema);

export default Warranty;