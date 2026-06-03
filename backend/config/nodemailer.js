const nodemailer = require('nodemailer');

/**
 * Gmail SMTP transporter with explicit settings.
 * Uses port 587 + STARTTLS instead of port 465 (SSL) because many
 * cloud providers (Render, Railway, etc.) block or throttle port 465.
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use STARTTLS (upgrades to TLS after connect)
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10000, // 10s to establish connection
  greetingTimeout: 10000,   // 10s for SMTP greeting
  socketTimeout: 15000,     // 15s for socket inactivity
  logger: process.env.NODE_ENV === 'production', // log SMTP traffic in prod for debugging
  debug: process.env.NODE_ENV === 'production',  // verbose SMTP debug in prod
});

// Verify connection on startup (non-blocking)
transporter.verify((error) => {
  if (error) {
    console.error('⚠️  Email transporter FAILED verification:');
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   GMAIL_USER set:', !!process.env.GMAIL_USER);
    console.error('   GMAIL_APP_PASSWORD set:', !!process.env.GMAIL_APP_PASSWORD);
    console.error('   OTP and reset emails will NOT be sent until this is resolved.');
  } else {
    console.log('✅ Email transporter ready (smtp.gmail.com:587 STARTTLS)');
  }
});

module.exports = transporter;
