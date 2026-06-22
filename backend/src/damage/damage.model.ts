import mongoose, { Types } from "mongoose";
import { IDamage } from "./damage.type";

const damageSchema = new mongoose.Schema<IDamage>(
  {
    batchID: {
      type: Types.ObjectId,
      ref: "Batch",
      default: null,
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
    serial: {
      type: String,
      default: null,
      trim: true,
    },

    expireDate: {
      type: Date,
      default: null,
    },

    damagedQty: {
      type: Number,
      required: true,
      min: 1,
    }, 
    damageLoss: {
      type: Number,
      default: 0
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      enum: ["expired", "manual"],
      required: true,
      default: "manual",
    },

    note: {
      type: String,
      default: null,
      trim: true,
    },

    DamageDate: {
      type: Date,
      default: Date.now,
    },
    deletable:{
      type:Boolean,
      default:true
    }
  },
  {
    timestamps: true,
  }
);

// indexes
damageSchema.index({ productID: 1 });

damageSchema.index({ batchID: 1 });

damageSchema.index({ purchaseID: 1 });

damageSchema.index({ DamageDate: -1 });

const Damage = mongoose.model<IDamage>("Damage", damageSchema);

export default Damage;