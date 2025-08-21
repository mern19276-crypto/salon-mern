const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  image: { type: String },
  gender: {
    type: String,
    enum: ["Male", "Female", "Unisex"],
    default: "Unisex",
  },
});

module.exports = mongoose.model("Service", serviceSchema);
