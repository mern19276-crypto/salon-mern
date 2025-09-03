const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Google login - Save or return user
router.post('/google-login', async (req, res) => {
  const { name, email, photoURL } = req.body;

  if (!email) return res.status(400).json({ message: 'Missing email' });

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, photoURL });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Error updating user" });
  }
});



module.exports = router;
