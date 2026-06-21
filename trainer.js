const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our security guard
const User = require('../models/User');     // Our Database Blueprint

// --- 1. GET ALL TRAINERS ---
// Used by Customers to browse available coaches
router.get('/list', auth, async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' })
                               .select('name email specialization experience');
    res.json(trainers);
  } catch (err) {
    console.error("Trainer List Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// --- 2. CONNECT CUSTOMER TO TRAINER ---
// Used when a Customer chooses a coach
router.put('/connect/:trainerId', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      user.trainerId = req.params.trainerId;
      await user.save();
      
      // Return updated user without password
      const updatedUser = await User.findById(req.user.id).select('-password');
      res.json(updatedUser);
    } catch (err) {
      res.status(500).send('Server Error');
    }
});

// --- 3. DISCONNECT FROM TRAINER (NEW) ---
// Used when a Customer wants to cancel their coach
router.put('/disconnect', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      
      // Remove the link to the trainer
      user.trainerId = null; 
      
      await user.save();
      
      // Send back the updated user so Frontend sidebar updates instantly
      const updatedUser = await User.findById(req.user.id).select('-password');
      res.json(updatedUser);
    } catch (err) {
      console.error("Disconnect Error:", err.message);
      res.status(500).send('Server Error');
    }
});

// --- 4. GET TRAINER'S CLIENTS ---
// Used by Trainers to see people who chose them
router.get('/clients', auth, async (req, res) => {
  try {
    const trainer = await User.findById(req.user.id);
    if (trainer.role !== 'trainer') {
        return res.status(403).json({ message: "Access denied. Trainers only." });
    }

    // Find all customers who have THIS trainer's ID saved
    const clients = await User.find({ trainerId: req.user.id }).select('-password');
    res.json(clients);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- 5. GET CLIENT DEEP DIVE (STATS) ---
// Used by Trainers to see a client's specific progress
router.get('/client/:id', auth, async (req, res) => {
    try {
      const client = await User.findById(req.params.id).select('-password');
      if (!client) return res.status(404).json({ message: "Client not found" });
      
      const today = new Date().toISOString().split('T')[0];
      const todayLog = client.dailyLogs?.find(l => l.date === today) || { meals: [], totalCalories: 0 };

      res.json({
        profile: client,
        todayLog: todayLog,
        weightHistory: client.weightHistory || [],
        workouts: client.workouts || []
      });
    } catch (err) {
      res.status(500).send('Server Error');
    }
});

module.exports = router;