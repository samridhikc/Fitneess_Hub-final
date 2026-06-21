const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/weight', require('./routes/weight'));
app.use('/api/calories', require('./routes/calories'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/stats', require('./routes/stats'));

// THIS LINE: Tells the server that any URL starting with /api/trainer
// should look into the file routes/trainer.js
app.use('/api/trainer', require('./routes/trainer')); 

// --- DB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch(err => console.log("DB ERROR:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});