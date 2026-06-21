const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message'); // 1. Import the Message model

// @route   GET /api/stats
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Calculate Today's Stats & Macros
    const todayLog = user.dailyLogs?.find(log => log.date === todayStr) || { meals: [], totalCalories: 0 };
    
    let macros = { protein: 0, carbs: 0, fat: 0 };
    todayLog.meals.forEach(m => {
        macros.protein += Number(m.protein || 0);
        macros.carbs += Number(m.carbs || 0);
        macros.fat += Number(m.fat || 0);
    });

    // 2. Calculate Weekly Activity (Last 7 Days)
    const days = [];
    const burnedData = [];
    const consumedData = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        days.push(dayName);
        const log = user.dailyLogs?.find(l => l.date === dateStr);
        consumedData.push(log ? log.totalCalories : 0);
        const dayWorkouts = user.workouts?.filter(w => w.date === dateStr) || [];
        burnedData.push(dayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0));
    }

    // 3. Get Latest Weight & BMI
    const latestWeight = user.weightHistory?.length > 0 
      ? user.weightHistory[user.weightHistory.length - 1].weight 
      : 0;

    let bmi = 0;
    if (latestWeight > 0 && user.height > 0) {
      bmi = (latestWeight / ((user.height/100) ** 2)).toFixed(1);
    }

    // --- 4. THE FIX: REAL MESSAGE COUNT ---
    let messageCount = 0;
    if (user.role === 'trainer') {
        // Count all messages in the whole database sent by customers
        messageCount = await Message.countDocuments({ sender: 'user' });
    }

    res.json({
      todayCalories: todayLog.totalCalories,
      currentWeight: latestWeight,
      bmi: bmi,
      plan: user.subscription?.plan || 'free',
      macros: macros,
      newMessages: messageCount, // <--- Now this is a real number!
      weekly: {
        labels: days,
        burned: burnedData,
        consumed: consumedData
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;