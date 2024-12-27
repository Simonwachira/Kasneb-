
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path')
const User = require('./models/user'); // Import user routes
const userRoutes = require('./models/user'); 
const bcrypt = require('bcrypt');
const connectToDatabase = require('./config/database'); //database routes
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const esp32Routes = require('./routes/esp32');
const Emailreset = require('./utils/email')
const PORT = 3000;

const app = express();

connectToDatabase();   //connect to MongoDB
app.use(express.json()); //JSON payloads
app.use('/user', userRoutes);
app.use('/api/auth', authRoutes); //Authentication Routs
app.use(bodyParser.urlencoded({ extended: true }));
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

// Show when server is well connected and running
app.get('/', (req, res) => {
  res.send('Welcome to the M-Pesa Callback Server!, server is running');
});
//Route to Mpesa callbaCK
app.post('/mpesa/callback', (req, res) => {
  console.log('M-Pesa Callback Data:', req.body);
  res.status(200).send('Callback received successfully!');
});


app.use(cors()); // Initializing express app
app.use('/api/auth', authRoutes); //Authentication Route
app.use('/api/payment', paymentRoutes); //payment Route
app.use('/api/esp32', esp32Routes); //Esp32 Route

//MongoDB User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Signup rOUTE
app.post('/signup', async (req, res) => {
  console.log("You are on sign up route now!");                  
  const { email, password,} = req.body;
  if (!email || !password) {return res.status(400).json({message: 'Email and password must be entered'})}

  try {

          const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).send({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword});
      const savedUser = await user.save();
      console.log('User saved:', savedUser);

      res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error as you tried to sign up:',error);
      res.status(500).json({ message: 'Error creating user' });
  }
});

// simo add Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).send({ message: 'Invalid email or password' });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).send({ message: 'Invalid email or password' });

      res.status(200).send({ message: 'Login successful' });
  } catch (err) {
      res.status(500).send({ message: 'Error logging in' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  // Destroying session to log out the user
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).json({ message: 'Failed to logout' });
      }
      res.clearCookie('connect.sid'); // Clear session cookie (if using cookie-based session)
      res.status(200).json({ message: 'Logged out successfully' });
  });

});

// protected route
app.get('/protected', (req, res) => {
  if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized access, please login' });
  }
  res.json({ message: 'Access granted', user: req.session.user });
});

app.use(express.static(__dirname)); //index.html', 'payment.html director

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {console.log(`Server running on port ${port}`) });


