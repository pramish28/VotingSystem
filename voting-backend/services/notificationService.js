const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Validate SMTP credentials
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('SMTP credentials missing in notificationService. Please set EMAIL_USER and EMAIL_PASS in .env');
}

// Initialize transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

const sendNotification = async (userId, message) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await transporter.sendMail({
      from: `"Voting System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Voting System Notification',
      text: message,
    });

    const notification = new Notification({ userId, message });
    await notification.save();

    console.log(`Notification email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send notification:', error.message, error.stack);
    throw error;
  }
};

module.exports = { sendNotification };