import mongoose, { Types } from "mongoose";
import { IProduct } from "./product.type";

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
      lowercase: true,
    },
    brandID: {
      type: Types.ObjectId,
      ref: "Brand",
      default: null,
    },
    unitID: {
      type: Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    categoryID: {
      type: Types.ObjectId,
      ref: "Category",
      default: null,
    },
    manageStock: {
      type: Boolean,
      default: true,
      required: true
    },
    manageWarranty: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
    },
    alertQty: {
      type: Number,
      default: 0,
    },
    decimal: {
      type: Boolean,
      default: false,
    },
    purchasePrice: {
      type: Number,
      default: 0,
    },
    salePrice: {
      type: Number,
      default: 0,
    },
    fifoBatchID: {
      type: Types.ObjectId,
      ref: "Batch",
      default: null
    },
    posEnabled:{
      type:Boolean,
      default:false
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ name: 1 }, { unique: true });
productSchema.index(
  { barcode: 1 },
  {
    unique: true,
    partialFilterExpression: { barcode: { $type: "string", $gt: "" } },
  }
);
const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
