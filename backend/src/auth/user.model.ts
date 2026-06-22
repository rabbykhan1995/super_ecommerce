import mongoose, { Types } from "mongoose";
import { IUser } from "./user.type";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    openID: {
      type: String,
      unique: true,
      default: null,
    },

    image: {
      type: String,
      default: null,
    },

    password: {
      type: String,
      default: null,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      default: null,
    },

    mobile: {
      type: String,
      default: null,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: "string" } },
  },
);
userSchema.index(
  { mobile: 1 },
  {
    unique: true,
    partialFilterExpression: { mobile: { $type: "string" } },
  },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
