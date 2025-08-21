const express = require("express");
const router = express.Router();
const Salon = require("../models/Salon");
const bcrypt = require("bcryptjs"); // install with: npm i bcryptjs

// ✅ Register Route (Step 1 + Step 2 combined)
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      workingHours,
      location,
      services,
      salonType,
      image,
      coordinates,
    } = req.body;

    // Check if salon already exists
    const existingSalon = await Salon.findOne({ email });
    if (existingSalon) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new salon
    const newSalon = new Salon({
      name,
      email,
      password: hashedPassword,
      phone,
      workingHours,
      location,
      services,
      salonType,
      image,
      coordinates,
    });

    await newSalon.save();
    res.status(201).json({ message: "Salon registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const salon = await Salon.findOne({ email });
    if (!salon) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, salon.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      salon: {
        id: salon._id,
        name: salon.name,
        email: salon.email,
        phone: salon.phone,
        location: salon.location,
        services: salon.services,
        workingHours: salon.workingHours,
        image: salon.image,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get All Salons (with optional ?location= query)
router.get("/", async (req, res) => {
  try {
    const { location } = req.query;
    const query = location ? { location: { $regex: location, $options: "i" } } : {};
    const salons = await Salon.find(query);
    res.json(salons);
  } catch (err) {
    console.error("Get salons error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Nearby Salons Route (25km radius from known Sri Lankan districts)
router.get("/nearby", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude and longitude required" });
  }

  try {
    const allSalons = await Salon.find();

    const districts = {
      colombo: { lat: 6.9271, lng: 79.8612 },
      kandy: { lat: 7.2906, lng: 80.6337 },
      galle: { lat: 6.0535, lng: 80.221 },
      jaffna: { lat: 9.6615, lng: 80.0255 },
      matara: { lat: 5.9549, lng: 80.5549 },
      kurunegala: { lat: 7.4868, lng: 80.3659 },
      anuradhapura: { lat: 8.3114, lng: 80.4037 },
      negombo: { lat: 7.2083, lng: 79.8358 },
      ratnapura: { lat: 6.6828, lng: 80.3992 },
      batticaloa: { lat: 7.7184, lng: 81.7001 },
      "nuwara eliya": { lat: 6.9497, lng: 80.7891 },
    };

    const getDistance = (lat1, lng1, lat2, lng2) => {
      const toRad = (v) => (v * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const nearbySalons = [];

    for (let salon of allSalons) {
      const salonLocation = salon.location?.toLowerCase() || "";

      for (let district in districts) {
        if (salonLocation.includes(district)) {
          const dist = getDistance(
            parseFloat(lat),
            parseFloat(lng),
            districts[district].lat,
            districts[district].lng
          );
          if (dist <= 25) {
            nearbySalons.push(salon);
          }
        }
      }
    }

    res.json(nearbySalons);
  } catch (err) {
    console.error("Nearby salons error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
