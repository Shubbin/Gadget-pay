const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

exports.sendOTP = async (email, otp) => {
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #0070f3; text-align: center;">GadgetFlex Verification</h2>
      <p>Hello,</p>
      <p>Your verification code for GadgetFlex is:</p>
      <div style="text-align: center; margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">GadgetFlex - Financing the future, bit by bit.</p>
    </div>
  `;
  return exports.sendEmail(email, 'Your GadgetFlex Verification Code', `Your OTP is ${otp}`, htmlContent, otp);
};

exports.sendEmail = async (to, subject, text, html, otp = null) => {
  try {
    const mailOptions = {
      from: `"GadgetFlex" <${process.env.BREVO_FROM_EMAIL || "shubbintech@gmail.com"}>`,
      to,
      subject,
      text,
      html: html || text,
    };

    // Commented out SMTP delivery for now
    // await transporter.sendMail(mailOptions);

    console.log(`--- [DEV MODE] EMAIL LOGGED FOR ${to} ---`);
    console.log(`Subject: ${subject}`);
    if (otp) console.log(`OTP Code: ${otp}`);
    console.log('-----------------------');
  } catch (error) {
    console.error('SMTP Error (Mocked):', error.message);
  }
};
