const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  type: String,
  text: String,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  photoURL: String,
  phone: String,
  gender: String,
  address: [addressSchema],
});

module.exports = mongoose.model("User", userSchema);
