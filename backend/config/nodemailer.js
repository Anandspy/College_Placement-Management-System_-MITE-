const nodemailer = require('nodemailer');

/**
 * Gmail SMTP transporter.
 *
 * NOTE: If the admin email is an institutional address (e.g. college domain),
 * those mail servers often reject or spam-filter automated emails from cloud
 * provider IPs (Render, Railway, etc.). In that case:
 * - Change the admin email in the DB to a Gmail address, OR
 * - Migrate to a transactional email service like Resend / SendGrid.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail', // uses port 465 SSL — proven to work on Render
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Verify connection on startup (non-blocking)
transporter.verify((error) => {
  if (error) {
    console.error('⚠️  Email transporter FAILED verification:');
    console.error('   Code:', error.code, '| Message:', error.message);
    console.error('   GMAIL_USER set:', !!process.env.GMAIL_USER);
    console.error('   GMAIL_APP_PASSWORD set:', !!process.env.GMAIL_APP_PASSWORD);
    console.warn('   OTP and reset emails will NOT be sent until this is fixed.');
  } else {
    console.log('✅ Email transporter ready — Gmail (service mode)');
    console.log('   Sending as:', process.env.GMAIL_USER);
  }
});

module.exports = transporter;
