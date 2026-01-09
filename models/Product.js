const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tags: { type: String },
  price: { type: Number, required: true },
  img: { type: String, required: true },
  category: { type: String },
});

module.exports = mongoose.model("Product", productSchema);
