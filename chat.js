const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// @route   GET /api/chat/:recipientId
// @desc    Get conversation between trainer and a specific customer
router.get('/:recipientId', auth, async (req, res) => {
  try {
    const isTrainer = req.user.role === 'trainer';
    
    // Logic: Find messages where (I sent to them) OR (They sent to me)
    const messages = await Message.find({
      $or: [
        { userId: req.user.id, recipientId: req.params.recipientId },
        { userId: req.params.recipientId, recipientId: req.user.id }
      ]
    }).sort({ date: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/chat
router.post('/', auth, async (req, res) => {
  try {
    const { text, recipientId } = req.body;
    
    const newMessage = new Message({
      userId: req.user.id,
      recipientId: recipientId, // Who is getting the message
      text: text,
      sender: req.user.role === 'trainer' ? 'trainer' : 'user'
    });

    const savedMsg = await newMessage.save();
    res.json(savedMsg);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;