const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  orderId: { type: String, required: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  items: { type: Array, required: true },
  total: { type: Number, required: true },

  shippingFee: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },

  paymentMethod: { type: String, required: true },
  status: { type: String, default: "處理中" },
  date: { type: Date, default: Date.now },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Order", orderSchema);
