const nodemailer = require('nodemailer');
const crypto = require('crypto'); //generate reset token
require('dotenv').config(); // Load environment variables from .env

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // Email service
  auth: {
    user: process.env.EMAIL_USERNAME, // Sender email address
    pass: process.env.EMAIL_PASSWORD, // Sender email password or app-specific password
  },
});

/**
 * Sends an email.
 *
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Plain text version of the email body.
 * @param {string} html - HTML version of the email body 
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Sender's email
      to,                           // Recipient's email
      subject,                      // Email subject
      text,                         // Email body in plain text
      html,                         // Email body in HTML 
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;
