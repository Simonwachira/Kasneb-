// Import necessary modules
const express = require('express');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');

const bcrypt = require('bcrypt'); // Ensure bcrypt is installed via npm
const User = require('../models/user'); // Adjust the path to your User model
const router = express.Router();

// POST: Signup route
router.post('/signup', async (req, res) => {
  try {
    console.log('Request body:', req.body); // Logs incoming request body
    const { email, password } = req.body;
      

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } }); // Adjust for your ORM or query
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to the database
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'Signup successful',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Signup Error:', error.message); // Logs error to the console
    res.status(500).json({ message: 'Error signing up.' });
  }
});

module.exports = router;
