const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET all weight logs
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.weightHistory || []);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// POST a new weight
router.post('/', auth, async (req, res) => {
  try {
    const { weight, date } = req.body;
    const user = await User.findById(req.user.id);

    const newEntry = {
      weight: parseFloat(weight),
      date: date,
      id: Date.now() // Unique ID for finding it later to delete
    };

    if (!user.weightHistory) user.weightHistory = [];
    user.weightHistory.push(newEntry);
    user.weight = weight;

    user.markModified('weightHistory');
    await user.save();
    res.json(user.weightHistory);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// DELETE a weight entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // Filter out the item with the matching ID
    user.weightHistory = user.weightHistory.filter(w => w.id.toString() !== req.params.id);
    
    user.markModified('weightHistory');
    await user.save();
    res.json(user.weightHistory);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;