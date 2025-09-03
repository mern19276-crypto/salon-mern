// ✅ 3. models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },
  professionalId: { type: mongoose.Schema.Types.ObjectId, ref: "Professional" },
  services: [
    {
      name: String,
      price: Number,
      duration: String,
    },
  ],
  user: {
    name: String,
    email: String,
    phone: String,
    photoURL: String,
  },
  date: String, // YYYY-MM-DD
  startTime: String, // HH:mm
  endTime: String,   // HH:mm
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", appointmentSchema);

