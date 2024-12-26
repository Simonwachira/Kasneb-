require('dotenv').config();
const express = require('express');
const path = require('path')
const User = require('./models/user'); // Import user routes
const userRoutes = require('./models/user'); // Import user routes
const bcrypt = require('bcrypt');
const connectToDatabase = require('./config/database'); //add simo
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const esp32Routes = require('./routes/esp32');
const Emailreset = require('./utils/email')
const PORT = 3000;

const app = express();

// Connect to MongoDB
connectToDatabase(); //add simo


// added simo Middleware for parsing JSON
app.use(express.json()); // Use this for JSON payloads
//add simo Use user routes, prefixing them with '/users'
app.use('/user', userRoutes);
//app.use('/api/auth', require('./routes/auth')); //add simo
app.use('/api/auth', authRoutes); //add simo
app.use(bodyParser.urlencoded({ extended: true })); // Optional: For form data


const sequelize = require('./config/database'); // Adjust for your DB config

app.get('/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send('Database connection successful!');
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(500).send('Database connection failed');
  }
});

// add simo Default route to test server
//app.get('/', (req, res) => {
 // res.send('Server is running!');
//});


// Add a route for '/'
app.get('/', (req, res) => {
  res.send('Welcome to the M-Pesa Callback Server!, server is running');
});


 //mpesa-callback Route
app.post('/mpesa/callback', (req, res) => {
  console.log('M-Pesa Callback Data:', req.body);
  res.status(200).send('Callback received successfully!');
});


// Initialize express app
//
app.use(cors());
//app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/esp32', esp32Routes);

// MongoDB connection
//mongoose.connect(process.env.MONGO_URI) //{useNewUrlParser: true, useUnifiedTopology: true })
 // .then(() => console.log('MongoDB connected'))
 // .catch(err => console.log(err));

// simo add User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//const User = mongoose.model('User', userSchema);

// simo add Routes
// Signup
app.post('/signup', async (req, res) => {
  console.log("You are on sign up route now!");                     //add simo
  //res.status(200).json({ message: "Route working" }); //add simo
  const { email, password,} = req.body;
  if (!email || !password) {return res.status(400).json({message: 'Email and password must be entered'})}

  try {

          const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).send({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword});
      const savedUser = await user.save();
      console.log('User saved:', savedUser);

//changed send to .json
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

// add simo Serve static files from the "public" directory
//app.use(express.static(path.join(__dirname, 'index.html', 'payment.html')));
app.use(express.static(__dirname));



const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {console.log(`Server running on port ${port}`) });


