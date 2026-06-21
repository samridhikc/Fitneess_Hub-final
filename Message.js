const mongoose = require('mongoose');

// This is the "Blueprint" for every chat message saved in your database
const MessageSchema = new mongoose.Schema({
  // 1. SENDER: The ID of the person who typed the message
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, 

  // 2. RECEIVER: The ID of the person getting the message
  // This allows the Trainer to talk to a specific client
  recipientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },            

  // 3. CONTENT: The actual text of the message
  text: { 
    type: String, 
    required: true 
  },

  // 4. ROLE: Is the person sending this a 'user' or a 'trainer'?
  sender: { 
    type: String, 
    enum: ['user', 'trainer'], 
    required: true 
  },

  // 5. TIME: Automatically formats the current time (e.g., "09:25 PM")
  time: { 
    type: String, 
    default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
  },

  // 6. DATE: Used for sorting the messages in order
  date: { 
    type: Date, 
    default: Date.now 
  }
});

// Export the model so the Chat route can use it
module.exports = mongoose.model('Message', MessageSchema);