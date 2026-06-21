const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// POST /api/calories/log
router.post('/log', auth, async (req, res) => {
  try {
    const { mealType, food } = req.body;
    const user = await User.findById(req.user.id);
    const today = new Date().toISOString().split('T')[0];

    if (!user.dailyLogs) user.dailyLogs = [];
    let dayIndex = user.dailyLogs.findIndex(log => log.date === today);

    const foodEntry = { ...food, mealType, logId: Date.now() };

    if (dayIndex === -1) {
      user.dailyLogs.push({ date: today, meals: [foodEntry], totalCalories: food.calories });
    } else {
      user.dailyLogs[dayIndex].meals.push(foodEntry);
      user.dailyLogs[dayIndex].totalCalories += food.calories;
    }

    user.markModified('dailyLogs');
    await user.save();
    const updatedDay = user.dailyLogs.find(log => log.date === today);
    res.json(updatedDay);
  } catch (err) {
    res.status(500).json({ message: "Save Failed" });
  }
});

// GET /api/calories/today
router.get('/today', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date().toISOString().split('T')[0];
    const dayLog = user.dailyLogs?.find(log => log.date === today);
    res.json(dayLog || { meals: [], totalCalories: 0 });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// DELETE a specific food item from a meal
router.delete('/log/:logId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date().toISOString().split('T')[0];
    let dayIndex = user.dailyLogs.findIndex(log => log.date === today);

    if (dayIndex !== -1) {
      const dayLog = user.dailyLogs[dayIndex];
      const foodItem = dayLog.meals.find(m => m.logId.toString() === req.params.logId);
      
      if (foodItem) {
        dayLog.totalCalories -= foodItem.calories; // Subtract the calories
        dayLog.meals = dayLog.meals.filter(m => m.logId.toString() !== req.params.logId); // Remove the item
        
        user.markModified('dailyLogs');
        await user.save();
        return res.json(dayLog);
      }
    }
    res.json({ meals: [], totalCalories: 0 });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;