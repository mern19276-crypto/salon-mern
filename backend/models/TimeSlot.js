const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  salonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true,
  },
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professional",
    required: true,
  },
  date: {
    type: String,
    required: true, // Format: YYYY-MM-DD
  },
  startTime: {
    type: String,
    required: true, // Format: HH:mm
  },
  endTime: {
    type: String,
    required: true, // Format: HH:mm
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("TimeSlot", timeSlotSchema);
