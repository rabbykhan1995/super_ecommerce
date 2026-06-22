import mongoose from "mongoose";
import { IUnit } from "./unit.type";

const unitSchema = new mongoose.Schema<IUnit>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
);

const Unit = mongoose.model<IUnit>("Unit", unitSchema);

export default Unit;
