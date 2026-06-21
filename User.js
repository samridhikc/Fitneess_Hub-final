const mongoose = require('mongoose');

// This is the "Blueprint" for your User data in the database
const UserSchema = new mongoose.Schema({
  // --- ACCOUNT IDENTITY ---
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['customer', 'trainer'], 
    default: 'customer' 
  },

  // --- TRAINER CONNECTION (THE NEW FIELD) ---
  // This stores the ID of the trainer that a customer chooses.
  // 'ref: User' tells MongoDB that this ID points to another person in this same list.
  trainerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },

  // --- PROFILE INFO (General) ---
  age: Number,
  gender: String,
  height: Number,
  fitnessGoal: String, // For Customers (e.g., "Lose Weight")
  
  // --- TRAINER SPECIFIC INFO ---
  specialization: String, // For Trainers (e.g., "Yoga")
  experience: Number,     // For Trainers (Years)

  // --- MEMBERSHIP ---
  subscription: { 
    plan: { type: String, default: 'free' } 
  },

  // --- TRACKING DATA (FLEXIBLE ARRAYS) ---
  // We use "strict: false" below so we can save any data format in these lists
  weightHistory: { type: Array, default: [] },
  workouts: { type: Array, default: [] }, 
  goals: { type: Array, default: [] },
  myFoods: { type: Array, default: [] },
  myRecipes: { type: Array, default: [] },
  dailyLogs: { type: Array, default: [] }

}, { 
  // OPTIONS
  strict: false,    // Allows us to be flexible with the data we save
  minimize: false,  // Ensures empty arrays are still saved to the database
  timestamps: true  // Automatically adds "createdAt" so we can see when a user joined
});

module.exports = mongoose.model('User', UserSchema);