 import mongoose from "mongoose";


const purchaseCounterSchema = new mongoose.Schema(
  {
      
    counter: { type: Number, default: 0 }
 
  }
);


const PurchaseCounter = mongoose.model("PurchaseCounter", purchaseCounterSchema);

export default PurchaseCounter;