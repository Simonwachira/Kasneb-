
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');  // For hashing passwords
const crypto = require('crypto'); // import For OTP generation
const express = require('express');
const validator = require('validator');
const router = express.Router();

// User signup route
router.post('/signup', (req, res) => {
    const {email, password}= req.body;
    console.log('User Signup Data:', userData);

    res.status(201).json({ message: 'User registered successfully!' });
});

// User login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    res.status(200).json({ message: 'User logged in successfully!' });
});

router.post('/reset-password', async (req, res) => {
    const { email, newPassword, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not registered' });

        if (!user.verifyOTP(otp)) {
            return res.status(400).json({ message: 'Invalid' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: 'try again to reset your password' });
    }
});

module.exports = router; 

// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,  
    },
    password: {
        type: String,
        required: true,
    },


    verified: {
        type: Boolean,
       default: false,  
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

// Pre save middleware to hash password with bcrypt
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// compare input password with hashed password in the database
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// generate OTP
userSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();  // 6-digit OTP
    this.otp = otp;
    this.otpExpires = Date.now() + 15 * 60 * 1000;  // OTP expires in 15 minutes
    return otp;
};

// verify OTP
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
