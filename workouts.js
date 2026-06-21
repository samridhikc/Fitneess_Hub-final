const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// POST /api/workouts
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, duration, calories } = req.body;
    
    const newWorkout = {
      name: name,
      type: type,
      duration: Number(duration),
      calories: Number(calories || 0),
      date: new Date().toISOString().split('T')[0],
      id: Date.now()
    };

    // This command is like a "Direct Injection" into the database
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { workouts: { $each: [newWorkout], $position: 0 } } },
      { new: true, upsert: true }
    );

    console.log("Workout saved for:", updatedUser.email);
    res.json(updatedUser.workouts);

  } catch (err) {
    console.log("TERMINAL ERROR MESSAGE:", err.message);
    res.status(500).json({ message: "Database Save Failed" });
  }
});

// GET /api/workouts
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user ? user.workouts : []);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;