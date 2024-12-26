const mongoose = require('mongoose');
const bcrypt = require('bcrypt');  // For hashing passwords
const crypto = require('crypto'); // For OTP generation
const express = require('express');
const router = express.Router();

// User signup route
router.post('/signup', (req, res) => {
    const userData = req.body;
    console.log('User Signup Data:', userData);

    // Add signup logic here (e.g., save user to the database)
    res.status(201).json({ message: 'User registered successfully!' });
});

// User login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    // Add login logic here (e.g., verify user credentials)
    res.status(200).json({ message: 'User logged in successfully!' });
});

module.exports = router; // Export the router





// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,  // Ensure no duplicates
       // match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Email validation regex
    },
    password: {
        type: String,
        required: true,
    },

    


    verified: {
        type: Boolean,
       default: false,  // Set default to false until email is verified
   },
    otp: {
        type: String,   // OTP for email verification
        default: null,
    },
    otpExpires: {
        type: Date,     // Expiry time for OTP
default: null,
    },
   
},{
    timestamps: true,  // Automatically adds createdAt and updatedAt
});

const User = mongoose.model('User',userSchema)
module.exports = User; //add

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare input password with hashed password in the database
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();  // 6-digit OTP
    this.otp = otp;
    this.otpExpires = Date.now() + 15 * 60 * 1000;  // OTP expires in 15 minutes
    return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function (otp) {
    if (this.otp === otp && this.otpExpires > Date.now()) {
        this.verified = true;
        this.otp = null;  // Reset OTP after successful verification
        this.otpExpires = null;
        return true;
    }
    return false;
};

// Export User model
module.exports = mongoose.model('User', userSchema);
