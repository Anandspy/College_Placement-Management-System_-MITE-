const transporter = require('../config/nodemailer');

/**
 * Send OTP verification email
 * @param {string} fullName - User's full name
 * @param {string} email - User's email
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPEmail = async (fullName, email, otp) => {
  const mailOptions = {
    from: `"MITE Placement Cell" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Your Verification Code: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#F8F9FA;font-family:'Inter',Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;">
          <!-- Header -->
          <tr>
            <td style="background-color:#09529B;padding:24px 32px;text-align:center;">
              <h1 style="color:#ffffff;font-size:32px;margin:0;font-weight:800;letter-spacing:1px;font-family:'Montserrat',Arial,sans-serif;">MITE</h1>
              <p style="color:#ffffff;font-size:14px;margin:8px 0 0;font-weight:600;letter-spacing:0.5px;opacity:0.9;">Placement Portal</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 32px;">
              <p style="color:#1A1D21;font-size:16px;font-weight:600;margin:0 0 8px;">Hi ${fullName},</p>
              <p style="color:#495057;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Use the code below to verify your email address and activate your placement portal account.
              </p>
              <!-- OTP Block -->
              <div style="text-align:center;margin:0 0 24px;">
                <div style="display:inline-block;background-color:#F48120;border-radius:12px;padding:16px 32px;">
                  <span style="font-family:'JetBrains Mono','Courier New',monospace;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:8px;">${otp}</span>
                </div>
              </div>
              <p style="color:#495057;font-size:13px;line-height:1.5;margin:0 0 8px;text-align:center;">
                This code expires in <strong>10 minutes</strong>.
              </p>
              <p style="color:#6C757D;font-size:12px;line-height:1.5;margin:24px 0 0;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#063872;padding:20px 32px;text-align:center;">
              <p style="color:#9DB5D1;font-size:11px;line-height:1.5;margin:0;">
                This is an automated message from MITE Placement Cell.<br>
                Do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('Failed to send OTP email:', error.message);
    // Don't throw — allow registration to succeed even if email fails
    // The user can resend OTP later
  }
};

/**
 * Send password reset email
 * @param {string} fullName - User's full name
 * @param {string} email - User's email
 * @param {string} resetURL - Full URL for password reset
 */
const sendResetEmail = async (fullName, email, resetURL) => {
  const mailOptions = {
    from: `"MITE Placement Cell" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Reset your portal password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#F8F9FA;font-family:'Inter',Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;">
          <!-- Header -->
          <tr>
            <td style="background-color:#09529B;padding:24px 32px;text-align:center;">
              <h1 style="color:#ffffff;font-size:32px;margin:0;font-weight:800;letter-spacing:1px;font-family:'Montserrat',Arial,sans-serif;">MITE</h1>
              <p style="color:#ffffff;font-size:14px;margin:8px 0 0;font-weight:600;letter-spacing:0.5px;opacity:0.9;">Placement Portal</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 32px;">
              <p style="color:#1A1D21;font-size:16px;font-weight:600;margin:0 0 8px;">Hi ${fullName},</p>
              <p style="color:#495057;font-size:14px;line-height:1.6;margin:0 0 24px;">
                We received a request to reset your password. Click the button below to set a new password.
              </p>
              <!-- CTA Button -->
              <div style="text-align:center;margin:0 0 24px;">
                <a href="${resetURL}" style="display:inline-block;background-color:#F48120;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 40px;border-radius:8px;">
                  Reset Password
                </a>
              </div>
              <p style="color:#495057;font-size:13px;line-height:1.5;margin:0 0 8px;text-align:center;">
                This link expires in <strong>15 minutes</strong>.
              </p>
              <p style="color:#6C757D;font-size:12px;line-height:1.5;margin:24px 0 0;">
                If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#063872;padding:20px 32px;text-align:center;">
              <p style="color:#9DB5D1;font-size:11px;line-height:1.5;margin:0;">
                This is an automated message from MITE Placement Cell.<br>
                Do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('Failed to send reset email:', error.message);
  }
};

/**
 * Send Admin login OTP email (security-themed)
 * @param {string} fullName - Admin's full name
 * @param {string} email - Admin's email
 * @param {string} otp - 6-digit OTP code
 */
const sendAdminOTPEmail = async (fullName, email, otp) => {
  const mailOptions = {
    from: `"MITE Placement Cell — Security" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `[ADMIN] Login Verification Code: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#0F0F0F;font-family:'Inter',Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:28px 32px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <span style="font-size:22px;">🛡️</span>
                <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:800;letter-spacing:1px;">MITE Admin Portal</h1>
              </div>
              <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;font-weight:500;letter-spacing:1px;text-transform:uppercase;">Security Verification</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#1e1e2e;padding:40px 32px;">
              <p style="color:#e2e8f0;font-size:16px;font-weight:600;margin:0 0 8px;">Hi ${fullName},</p>
              <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 28px;">
                A sign-in attempt was made on the <strong style="color:#e2e8f0;">MITE Admin Dashboard</strong>.
                Use the code below to complete your login. This code is valid for <strong style="color:#f59e0b;">10 minutes</strong>.
              </p>
              <!-- OTP Block -->
              <div style="text-align:center;margin:0 0 28px;">
                <div style="display:inline-block;background:linear-gradient(135deg,#1e40af,#7c3aed);border-radius:14px;padding:20px 40px;">
                  <span style="font-family:'JetBrains Mono','Courier New',monospace;font-size:36px;font-weight:700;color:#ffffff;letter-spacing:10px;">${otp}</span>
                </div>
              </div>
              <div style="background:#2d1b0e;border:1px solid #92400e;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
                <p style="color:#fbbf24;font-size:13px;margin:0;line-height:1.6;">
                  ⚠️ <strong>Security Notice:</strong> If you did not attempt to log in, your credentials may be compromised. 
                  Please contact the system administrator immediately and change your password.
                </p>
              </div>
              <p style="color:#64748b;font-size:12px;line-height:1.5;margin:0;text-align:center;">
                This code will expire automatically. Do not share it with anyone.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#0f0f1a;padding:20px 32px;text-align:center;border-top:1px solid #1e293b;">
              <p style="color:#475569;font-size:11px;line-height:1.5;margin:0;">
                MITE Placement Cell — Automated Security Alert<br>
                Do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send admin OTP email:', error.message);
    // Don't throw — caller handles this
  }
};

module.exports = {
  sendOTPEmail,
  sendResetEmail,
  sendAdminOTPEmail,
};
