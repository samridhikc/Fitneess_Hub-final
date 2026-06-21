const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- 1. REGISTRATION ROUTE ---
// Handles creating new accounts with specific roles
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with the chosen role (default to customer)
    user = new User({ 
        name, 
        email, 
        password: hashedPassword, 
        role: role || 'customer' 
    });
    
    await user.save();

    // Create security token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Send back token and user info (including role)
    res.json({ 
        token, 
        user: { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            subscription: user.subscription 
        } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 2. LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create security token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 3. FORGOT PASSWORD ROUTE ---
// Generates a code and logs it to the terminal for demo purposes
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "No user found with this email" });

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Log the code to the black terminal so you can see it
    console.log(`[PASSWORD RESET] Email: ${req.body.email} | Code: ${resetCode}`);

    res.json({ 
        message: "Code generated! Check your terminal or the demo hint.", 
        code: resetCode 
    }); 
    
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- 4. RESET PASSWORD ROUTE ---
// Updates the password in the database
router.post('/reset-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the database
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    
    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;