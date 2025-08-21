const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema({
  name: String,
  image: String,
  role: String,
  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
  },
  available: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Professional", professionalSchema);
