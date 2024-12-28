require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const User = require('./models/user'); // Import user model
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const connectToDatabase = require('./config/database'); // Database connection
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const esp32Routes = require('./routes/esp32');
const sendOTPEmail = require('./utils/email'); // Assuming you have a utility for sending emails

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
connectToDatabase(); // Connect to MongoDB

// MongoDB User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date }, // Expiration time for OTP
});
const User = mongoose.model('User', userSchema);

// Test DB Connection Route
const sequelize = require('./config/database');
app.get('/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send('Database connection successful!');
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(500).send('Database connection failed');
  }
});

// Basic server route
app.get('/', (req, res) => {
  res.send('Welcome to the M-Pesa Callback Server! Server is running.');
});

// M-Pesa callback route
app.post('/mpesa/callback', (req, res) => {
  console.log('M-Pesa Callback Data:', req.body);
  res.status(200).send('Callback received successfully!');
});

// Signup Route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({ email, password: hashedPassword, otp, otpExpiry });
    await user.save();

    await sendOTPEmail(email, otp); // Send OTP to user email
    res.status(201).json({ message: 'User created successfully. OTP sent to your email.' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Verify OTP Route
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP after verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Account verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// Resend OTP Route
app.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: 'OTP resent to your email.' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ message: 'Error resending OTP' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password' });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Logout Route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Failed to logout' });

    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Static file serving
app.use(express.static(__dirname)); // Serve index.html, payment.html, etc.

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
