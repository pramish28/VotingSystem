const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendNotification = async (userId, message) => {
  try {
    const notification = new Notification({ userId, message });
    await notification.save();
    await transporter.sendMail({
      to: (await User.findById(userId)).email,
      subject: 'Voting System Notification',
      text: message,
    });
  } catch (err) {
    console.error('Failed to send notification:', err);
  }
};