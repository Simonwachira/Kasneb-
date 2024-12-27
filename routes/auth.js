const express = require('express');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');

const bcrypt = require('bcrypt'); //bcrypt is installed 
const User = require('../models/user'); //path to User model
const router = express.Router();

// POST, Signup route
router.post('/signup', async (req, res) => {
  try {
    console.log('Request body:', req.body); // incoming logs
    const { email, password } = req.body;
      

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'please insert your email & password .' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({  email }); 
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to the Mongodatabase
    const newUser = new User({email,password:hashedPassword}) 
    await newUser.save(); 

    res.status(201).json({
      message: 'Signup successful',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Signup Error:', error.message); 
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

module.exports = router;
