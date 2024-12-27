const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// M-Pesa API credentials foe .env file
const {
    MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET,
    MPESA_SHORTCODE,
    MPESA_SANDBOX_URL,
} = process.env;

// M-Pesa OAuth Token URL
const OAUTH_URL = `${MPESA_SANDBOX_URL}/oauth/v1/generate?grant_type=client_credentials`;

// Generate an OAuth token for M-Pesa authentication
/**
 * @returns {Promise<string>} The access token.
 */
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

        throw new Error('Failed to get M-Pesa tokens');
    } catch (error) {
        console.error('Error getting M-Pesa tokens:', error);
        throw error;
    }
}

/**
 * Initiates a C2B payment request.
 * @param {string} phoneNumber
 * @param {number} amount 
 * @returns {Promise<object>}
 */

// Function to initiate Customer to Business payment
async function initiatePayment(phoneNumber, amount) {
    const token = await getMpesaToken();

    // Customer to Business Payment request url
    const paymentUrl = `${MPESA_SANDBOX_URL}/mpesa/c2b/v1/paymentrequest`;

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const requestBody = {
        Shortcode: MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        Amount: amount,
        AccountReference: 'PaymentRef',
        shortpin: MPESA_PASSKEY    };

    try {
        const response = await axios.post(paymentUrl, requestBody, { headers });
        if (response.data && response.data.ResponseCode === '0') {
            return response.data;  
        } else {
            throw new Error(`Payment initiation failed: ${response.data.ResponseDescription}`);
        }
    } catch (error) {
        console.error('Error initiating payment:', error);
        throw error;
    }
}

// status of a payment
/**
  @param {string} transactionId 
  @returns {Promise<object>}
 */ 

async function checkPaymentStatus(transactionId) {
    const token = await getMpesaToken();

    const statusUrl = `${MPESA_SANDBOX_URL}/mpesa/c2b/v1/querypaymentstatus`;

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const requestBody = {
        Shortcode: MPESA_SHORTCODE,
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
