const express = require('express');
const router = express.Router();
const mpesaService = require('../services/mpesa');

// Make Payment Route
router.post('/make-payment', async (req, res) => {
    const { phoneNumber, amount } = req.body;
    try {
        const paymentResponse = await mpesaService.sendPayment(phoneNumber, amount);
        console.log(`Payment initiated: Phone - ${phoneNumber}, Amount - ${amount}`);
        res.status(200).json(paymentResponse);
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Payment failed' });
    }
});

module.exports = router;
