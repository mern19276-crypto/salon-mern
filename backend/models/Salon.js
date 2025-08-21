const mongoose = require("mongoose");

const salonSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // 🔐 Added password
  phone: String,
  location: String,
  workingHours: String,
  services: [String],
  salonType: String,
  image: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
});

module.exports = mongoose.model("Salon", salonSchema);
