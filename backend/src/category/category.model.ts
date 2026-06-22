import mongoose from "mongoose";
import { ICategory} from "./category.type";

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
);

const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
