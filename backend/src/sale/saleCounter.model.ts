 import mongoose from "mongoose";


const saleCounterSchema = new mongoose.Schema(
  {
      
    counter: { type: Number, default: 0 }
 
  }
);


const SaleCounter = mongoose.model("SaleCounter", saleCounterSchema);

export default SaleCounter;