const nodemailer = require('nodemailer');
const sendEmail = require('./utils/email');
const crypto = require('crypto'); //generate reset token
require('dotenv').config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // Email service
  auth: {
    user: process.env.EMAIL_USERNAME, // Sender email address
    pass: process.env.EMAIL_PASSWORD, // Sender email password
  },
});
const generateResetToken = () => {
  const buffer = crypto.randomBytes(32);
  return buffer.toString('hex');
};

/**
 * Sends a password reset email.
 *
 * @param {string} userEmail - Recipient's email address.
 * @param {string} resetToken - Reset token for the user.
 * @returns {Promise<void>}
 */
const sendResetEmail = async (userEmail, resetToken) => {
  const resetLink = `http://44.208.33.130:3000/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const text = `Click the link to reset your password: ${resetLink}`;
  const html = `${userName}, <p>Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`;
  
  try {
    await sendEmail(userEmail, subject, text, html);
  } catch (error) {
    console.error(`Error sending a reset email: ${error.message}`);
    throw error;
  }
};


/**
 * Sends an email.
 *
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Plain text version of the email body.
 * @param {string} html - HTML version of the email body (optional).
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

module.exports = {
  generateResetToken,
  sendResetEmail,};
