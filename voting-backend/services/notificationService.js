const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Initialize transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

const sendNotification = async (userId, message) => {
  try {
    const notification = new Notification({ userId, message });
    await notification.save();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    await transporter.sendMail({
      to: user.email,
      subject: 'Voting System Notification',
      text: message,
    });
    console.log(`Notification email sent to ${user.email}`);
  } catch (err) {
    console.error('Failed to send notification:', err.message, err.stack);
    throw err;
  }
};

const sendVerificationCode = async (email, uniqueCode) => {
  try {
    console.log(`Attempting to send verification code to ${email}`);
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Your Verification Code',
      html: `<h3>Your Verification Code</h3><p>Your unique verification code is: <strong>${uniqueCode}</strong></p>`,
    });
    console.log(`Verification code sent to ${email}`);
  } catch (err) {
    console.error('Failed to send verification code:', err.message, err.stack);
    throw err;
  }
};

module.exports = { sendNotification, sendVerificationCode };