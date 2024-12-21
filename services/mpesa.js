const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// M-Pesa API credentials and URLs from your `.env` file
const {
    MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET,
    MPESA_SHORTCODE,
    MPESA_LIPA_NA_MPESA_SHORTCODE,
    MPESA_LIPA_NA_MPESA_SHORTCODE_SHORTPIN,
    MPESA_LIPA_NA_MPESA_LIPA_NA_URL,
    MPESA_SANDBOX_URL,
} = process.env;

// M-Pesa OAuth Token URL
const OAUTH_URL = `${MPESA_SANDBOX_URL}/oauth/v1/generate?grant_type=client_credentials`;

// Generate an OAuth token for M-Pesa authentication
async function getMpesaToken() {
    const auth = `Basic ${Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64')}`;
    try {
        const response = await axios.get(OAUTH_URL, {
            headers: {
                Authorization: auth,
            },
        });
        if (response.data && response.data.access_token) {
            return response.data.access_token;
        }
        throw new Error('Failed to get M-Pesa token');
    } catch (error) {
        console.error('Error getting M-Pesa token:', error);
        throw error;
    }
}

// Function to initiate C2B payment (Customer to Business Payment)
async function initiatePayment(phoneNumber, amount) {
    const token = await getMpesaToken();

    // C2B Payment request URL (for Lipa na M-Pesa)
    const paymentUrl = `${MPESA_SANDBOX_URL}/mpesa/c2b/v1/paymentrequest`;

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const requestBody = {
        Shortcode: MPESA_LIPA_NA_MPESA_SHORTCODE,
        LipaNaMpesaOnlineShortcode: MPESA_LIPA_NA_MPESA_SHORTCODE,
        LipaNaMpesaOnlineShortPin: MPESA_LIPA_NA_MPESA_SHORTCODE_SHORTPIN,
        PhoneNumber: phoneNumber,  // Customer phone number
        Amount: amount,  // Amount to be paid
        AccountReference: "PaymentRef",  // Optional: Add custom reference
        PhoneNumber: phoneNumber,  // Customer phone number (again)
    };

    try {
        const response = await axios.post(paymentUrl, requestBody, { headers });
        if (response.data && response.data.ResponseCode === '0') {
            return response.data;  // Payment request was successful
        } else {
            throw new Error(`Payment initiation failed: ${response.data.ResponseDescription}`);
        }
    } catch (error) {
        console.error('Error initiating payment:', error);
        throw error;
    }
}

// Function to check the status of a payment (for example, after a callback from M-Pesa)
async function checkPaymentStatus(transactionId) {
    const token = await getMpesaToken();

    const statusUrl = `${MPESA_SANDBOX_URL}/mpesa/c2b/v1/querypaymentstatus`;

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const requestBody = {
        Shortcode: MPESA_LIPA_NA_MPESA_SHORTCODE,
        TransactionID: transactionId,
    };

    try {
        const response = await axios.post(statusUrl, requestBody, { headers });
        return response.data;
    } catch (error) {
        console.error('Error checking payment status:', error);
        throw error;
    }
}

// Exports
module.exports = {
    initiatePayment,
    checkPaymentStatus,
};
