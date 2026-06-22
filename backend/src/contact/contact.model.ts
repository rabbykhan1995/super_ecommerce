import mongoose from "mongoose";
import { IContact } from "./contact.type";


const contactSchema = new mongoose.Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["customer", "supplier", "both"],
      default: "customer",
    },
  },{ timestamps: true }

);

// search এর জন্য
contactSchema.index({ name: 1 });

// type filter + name search একসাথে fast
contactSchema.index({ type: 1, name: 1 });

const Contact = mongoose.model<IContact>("Contact", contactSchema);

export default Contact;
