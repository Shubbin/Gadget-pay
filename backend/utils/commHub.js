const twilio = require('twilio');
const { sendEmail: brevoSendEmail } = require('../services/emailService');

// Set these in .env
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendEmail = async (to, subject, text, html) => {
  await brevoSendEmail(to, subject, text, html);
};

const sendSMS = async (to, body) => {
  try {
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (err) {
    console.error('Error sending SMS:', err.message);
  }
};

module.exports = { sendEmail, sendSMS };
