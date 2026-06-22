import mongoose, { Types } from "mongoose";
import { IAccount } from "./account.type";
// this is final, no thing to update
const accountSchema = new mongoose.Schema<IAccount>(
  {
    name: {
      type: String,
      trim: true,
      required:true,
    },
    branch: {
      type: String,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    number:{
      type: String,
      required:true,
      trim:true,
    },
    default:{
        type:Boolean,
        default:false,
    }
  }, { timestamps: true }
);

const Account = mongoose.model<IAccount>("Account", accountSchema);

export default Account;
