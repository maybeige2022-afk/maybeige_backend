const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: { type: String, required: true, minlength: 2, maxlength: 50 },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 100,
  },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: "" },
  role: { type: String, default: "customer", enum: ["customer", "admin"] },
  cart: { type: Array, default: [] },
  date: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  usedCoupons: { type: [String], default: [] },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
