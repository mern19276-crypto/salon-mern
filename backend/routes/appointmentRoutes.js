const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const TimeSlot = require("../models/TimeSlot");
const Professional = require("../models/Professional");
const dayjs = require("dayjs");

// Helpers
const durationToMinutes = (durationStr) => {
  const parts = durationStr.split(" ");
  let minutes = 0;
  for (let i = 0; i < parts.length; i += 2) {
    const val = parseInt(parts[i]);
    const unit = parts[i + 1].toLowerCase();
    if (unit.includes("hour")) minutes += val * 60;
    else if (unit.includes("min")) minutes += val;
  }
  return minutes;
};

const computeEndTime = (startTime, duration) => {
  const [h, m] = startTime.split(":" ).map(Number);
  const totalStart = h * 60 + m;
  const totalEnd = totalStart + duration;
  const endH = String(Math.floor(totalEnd / 60)).padStart(2, "0");
  const endM = String(totalEnd % 60).padStart(2, "0");
  return `${endH}:${endM}`;
};

// 🔁 Auto-generate hourly time slots (9 AM - 6 PM) for all professionals for the next 7 days
const generateWeeklyTimeSlots = async () => {
  const professionals = await Professional.find();

  for (let i = 0; i < 7; i++) {
    const date = dayjs().add(i, "day").format("YYYY-MM-DD");

    for (const prof of professionals) {
      let currentTime = dayjs(`${date}T09:00`);
      const endTime = dayjs(`${date}T18:00`);

      while (currentTime.isBefore(endTime)) {
        const slotStart = currentTime.format("HH:mm");
        const slotEnd = currentTime.add(5, "minute").format("HH:mm");

        const exists = await TimeSlot.findOne({
          professionalId: prof._id,
          date,
          startTime: slotStart,
          endTime: slotEnd,
        });

        if (!exists) {
          await TimeSlot.create({
            salonId: prof.salonId,
            professionalId: prof._id,
            date,
            startTime: slotStart,
            endTime: slotEnd,
            isBooked: false,
          });
        }

        currentTime = currentTime.add(5, "minute");
      }
    }
  }
};


// Run on server start
generateWeeklyTimeSlots();

// ✅ GET appointments by salonId with optional filters
router.get("/salon/:id", async (req, res) => {
  try {
    const { date, professionalId } = req.query;
    const query = { salonId: req.params.id };
    if (date) query.date = date;
    if (professionalId) query.professionalId = professionalId;

    const appointments = await Appointment.find(query)
      .sort({ date: 1, startTime: 1 })
      .populate("salonId")
      .populate("professionalId");

    res.json(appointments);
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// ✅ POST create new appointments + mark slot isBooked: true
router.post("/", async (req, res) => {
  try {
    const { phone, email, name, appointments = [] } = req.body;
    if (!phone && !email) return res.status(400).json({ message: "Phone or email is required" });
    if (!appointments.length) return res.status(400).json({ message: "No appointments provided" });

    const saved = await Promise.all(
      appointments.map(async (appt) => {
        const durationMins = durationToMinutes(appt.duration || "30 minutes");
        const endTime = computeEndTime(appt.startTime, durationMins);

        const newAppt = new Appointment({
          salonId: appt.salonId,
          professionalId: appt.professionalId || null,
          services: [{ name: appt.serviceName, price: appt.price, duration: appt.duration }],
          date: appt.date,
          startTime: appt.startTime,
          endTime,
          user: {
            name: name || "Guest",
            phone: phone || "",
            email: email || "",
            photoURL: "",
          },
          status: "pending",
        });

        const savedAppt = await newAppt.save();

        await TimeSlot.updateMany(
          {
            professionalId: appt.professionalId,
            date: appt.date,
            startTime: { $gte: appt.startTime },
            endTime: { $lte: endTime },
            isBooked: false,
          },
          { isBooked: true }
        );

        return savedAppt;
      })
    );

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error("❌ Error saving appointments:", err);
    res.status(500).json({ success: false, message: "Failed to save appointments" });
  }
});

// ✅ GET appointments by user
router.get("/", async (req, res) => {
  const { email, phone } = req.query;
  try {
    const query = email
      ? { "user.email": email }
      : phone
      ? { "user.phone": phone }
      : {};

    const result = await Appointment.find(query).sort({ createdAt: -1 }).populate("salonId");
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    res.status(500).json({ message: "Error fetching appointments" });
  }
});

// ✅ DELETE appointment + free slot
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    await Appointment.findByIdAndDelete(req.params.id);

    await TimeSlot.updateMany(
      {
        professionalId: appointment.professionalId,
        date: appointment.date,
        startTime: { $gte: appointment.startTime },
        endTime: { $lte: appointment.endTime },
      },
      { isBooked: false }
    );

    res.json({ message: "Deleted successfully and slot updated" });
  } catch (err) {
    console.error("❌ Failed to delete appointment:", err);
    res.status(500).json({ message: "Failed to delete appointment" });
  }
});

// ✅ PATCH status update
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Appointment not found" });

    if (status === "cancelled") {
      await TimeSlot.updateMany(
        {
          professionalId: updated.professionalId,
          date: updated.date,
          startTime: { $gte: updated.startTime },
          endTime: { $lte: updated.endTime },
        },
        { isBooked: false }
      );
    }

    res.json({ success: true, updated });
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

module.exports = router;
