import mongoose from "mongoose";
import { IBrand } from "./brand.type";

const unitSchema = new mongoose.Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
);

const Brand = mongoose.model<IBrand>("Brand", unitSchema);

export default Brand;
