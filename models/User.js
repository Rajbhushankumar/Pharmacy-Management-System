const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "pharmacist"], default: "pharmacist" },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date, default: null },
  resetTokenUsed: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);
