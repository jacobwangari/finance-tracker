// test-email.js — run with `node test-email.js`, delete when done
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// First, verify the connection/credentials work at all
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ SMTP connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ SMTP connection successful, sending test email...');

  transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER,
    subject: 'Test email from Finance Tracker',
    text: 'If you got this, your SMTP config works.'
  }, (err, info) => {
    if (err) {
      console.error('❌ Send failed:', err.message);
      process.exit(1);
    }
    console.log('✅ Email sent:', info.response);
    process.exit(0);
  });
});