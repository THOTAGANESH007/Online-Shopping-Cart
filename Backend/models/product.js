import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: Array,
      default: [],
    },
    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
      },
    ],
    subCategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
      },
    ],
    unit: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    discount: {
      typr: Number,
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    more_details: {
      type: Object,
      default: {},
    },
    public: {
      type: Boolean,
      default: true,
    },
    publish: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", ProductSchema);
export default ProductModel;
