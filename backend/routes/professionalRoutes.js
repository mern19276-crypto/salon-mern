// routes/professionals.js

const express = require("express");
const router = express.Router();
const Professional = require("../models/Professional");

// GET: Fetch all professionals for a specific salon
router.get("/:salonId", async (req, res) => {
  try {
    const professionals = await Professional.find({ salonId: req.params.salonId });
    res.json(professionals); // Responds with professional array
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch professionals" });
  }
});

module.exports = router;
