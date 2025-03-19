import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
      },
    ],
  },
  { timestamps: true }
);

const SubCategoryModel = mongoose.model("SubCategory", SubCategorySchema);

export default SubCategoryModel;
