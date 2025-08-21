const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedbackModel");

// 📥 Submit feedback (Customer side)
router.post("/", async (req, res) => {
  try {
    const { appointmentId, salonId, userEmail, rating, comment } = req.body;

    const feedback = new Feedback({
      appointmentId,
      salonId,
      userEmail,
      rating,
      comment,
    });

    const saved = await feedback.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
});

// 📄 Get all feedbacks for a salon (Owner side)
router.get("/:salonId", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ salonId: req.params.salonId })
      .sort({ createdAt: -1 }); // newest first
    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    res.status(500).json({ message: "Failed to fetch feedbacks" });
  }
});

module.exports = router;
