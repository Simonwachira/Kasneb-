const mongoose = require('mongoose');

// Define the Transaction Schema
const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the user making the payment
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending',  // Default to 'Pending' when the transaction is created
    },
    mpesaResponseCode: {
        type: String,
    },
    mpesaTransactionId: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to update the `updatedAt` field before saving a document
transactionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create and export the Transaction model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

