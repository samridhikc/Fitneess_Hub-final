const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/goals
// @desc    Get all user goals
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.goals || []);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/goals
// @desc    Update the entire goals list
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update the goals array with what the frontend sent
    user.goals = req.body.goals;
    
    // Force save
    user.markModified('goals');
    await user.save();
    
    res.json(user.goals);
  } catch (err) {
    console.error("GOAL ERROR:", err.message);
    res.status(500).json({ message: "Database Error" });
  }
});

module.exports = router;