const crypto = require('crypto');
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const OTP = require('../models/OTP.model');
const generateOTP = require('../utils/generateOTP');
const ApiResponse = require('../utils/ApiResponse');
const { sendOTPEmail, sendResetEmail, sendAdminOTPEmail } = require('../services/email.service');

/**
 * POST /api/auth/register
 * Register a new student account
 */
const register = async (req, res, next) => {
  try {

    const { fullName, email, usnNumber, department, yearOfStudy, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(res, 'An account with this email already exists', 409);
    }

    // Check if USN record already exists
    const existingUSN = await User.findOne({ usnNumber: usnNumber.toUpperCase() });
    if (existingUSN) {
      return ApiResponse.error(res, 'This USN Number is already registered', 409);
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      usnNumber: usnNumber.toUpperCase(),
      department,
      yearOfStudy,
      password,
      role: 'student',
      isVerified: false,
    });

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Save OTP (will be hashed by pre-save hook)
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP email
    try {
      await sendOTPEmail(fullName, email, otp);
    } catch (emailError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Failed to send OTP email in dev:', emailError.message);
        console.log('--------------------------------------------');
        console.log('STUDENT REGISTRATION OTP (DEV ONLY):', otp);
        console.log('--------------------------------------------');
      } else {
        // Delete the newly created user and OTP so they can try again once SMTP is fixed
        await User.deleteOne({ _id: user._id });
        await OTP.deleteMany({ email });
        return ApiResponse.error(
          res,
          `Failed to send verification email: ${emailError.message}. Please configure SMTP settings.`,
          500
        );
      }
    }

    return ApiResponse.success(
      res,
      'Account created successfully. Please verify your email.',
      { email: user.email },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-email
 * Verify email with OTP
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find OTP record
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return ApiResponse.error(res, 'OTP not found or has expired. Please request a new one.', 400);
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return ApiResponse.error(res, 'Too many wrong attempts. Please request a new OTP.', 400);
    }

    // Check if expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return ApiResponse.error(res, 'OTP has expired. Please request a new one.', 400);
    }

    // Compare OTP
    const isMatch = await otpRecord.compareOTP(otp);

    if (!isMatch) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      return ApiResponse.error(res, 'Invalid OTP. Please try again.', 400);
    }

    // Update user as verified
    await User.findOneAndUpdate({ email }, { isVerified: true });

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    return ApiResponse.success(res, 'Email verified successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-otp
 * Resend OTP for email verification
 */
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists and is not verified
    const user = await User.findOne({ email });

    if (!user) {
      return ApiResponse.error(res, 'No account found with this email', 404);
    }

    if (user.isVerified) {
      return ApiResponse.error(res, 'Email is already verified', 400);
    }

    // Delete old OTP
    await OTP.deleteMany({ email });

    // Generate new OTP
    const otp = generateOTP();

    // Save new OTP
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP email
    try {
      await sendOTPEmail(user.fullName, email, otp);
    } catch (emailError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Failed to send OTP email in dev:', emailError.message);
        console.log('--------------------------------------------');
        console.log('STUDENT RESEND OTP (DEV ONLY):', otp);
        console.log('--------------------------------------------');
      } else {
        return ApiResponse.error(
          res,
          `Failed to resend OTP: ${emailError.message}. Please configure SMTP settings.`,
          500
        );
      }
    }

    return ApiResponse.success(res, 'OTP has been resent to your email.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const sanitizedEmail = email.trim().toLowerCase();

    // Find ONLY in user collection (Students/HR)
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return ApiResponse.error(res, 'Incorrect email or password', 401);
    }

    // Check if verified
    if (!user.isVerified) {
      return ApiResponse.error(
        res,
        'Please verify your email before logging in.',
        403,
        { needsVerification: true, email: user.email }
      );
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return ApiResponse.error(res, 'Incorrect email or password', 401);
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store hashed refresh token
    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    user.refreshToken = hashedRefreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const payloadUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      usnNumber: user.usnNumber,
      yearOfStudy: user.yearOfStudy,
    };

    return ApiResponse.success(res, 'Login successful', {
      accessToken,
      user: payloadUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/admin-login  (Step 1)
 * Validates admin credentials and sends OTP — does NOT issue JWT yet.
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const sanitizedEmail = email.trim().toLowerCase();

    // Find ONLY in Admin collection
    const admin = await Admin.findOne({ email: sanitizedEmail });

    // Timing-safe: always compare even if admin not found (use dummy string)
    let isMatch = false;
    if (admin) {
      isMatch = await admin.comparePassword(password);
    } else {
      const bcrypt = require('bcrypt');
      await bcrypt.compare(password, '$2b$10$abcdefghijklmnopqrstuv');
    }

    if (!admin || !isMatch) {
      return ApiResponse.error(res, 'Incorrect email or password', 401);
    }

    // --- Credentials valid: issue OTP challenge ---
    const otp = generateOTP();

    // Delete any previous OTP for this admin email
    await OTP.deleteMany({ email: sanitizedEmail });

    // Save hashed OTP (pre-save hook handles hashing)
    await OTP.create({
      email: sanitizedEmail,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP to admin email
    try {
      await sendAdminOTPEmail(admin.fullName, sanitizedEmail, otp);
    } catch (emailError) {
      console.error('⚠️ Admin OTP email delivery failed:', emailError.message);
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Email send failed in dev — OTP logged below for convenience.');
        console.log('--------------------------------------------');
        console.log('ADMIN OTP (DEV ONLY):', otp);
        console.log('--------------------------------------------');
      } else {
        // Clean up the OTP so the admin can retry immediately
        await OTP.deleteMany({ email: sanitizedEmail });
        return ApiResponse.error(
          res,
          'Credentials verified but failed to deliver the OTP email. Please try again or contact support.',
          500
        );
      }
    }

    // In dev, also log OTP for convenience even if email succeeded
    if (process.env.NODE_ENV !== 'production') {
      console.log('--------------------------------------------');
      console.log('ADMIN OTP (DEV ONLY):', otp);
      console.log('--------------------------------------------');
    }

    return ApiResponse.success(
      res,
      'Credentials verified. An OTP has been sent to your registered email.',
      {
        otpSent: true,
        email: sanitizedEmail,
        mustChangePassword: admin.mustChangePassword,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/admin-verify-otp  (Step 2)
 * Verifies the OTP and issues JWT + refresh token.
 */
const adminVerifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const sanitizedEmail = email.trim().toLowerCase();

    // Find admin
    const admin = await Admin.findOne({ email: sanitizedEmail });
    if (!admin) {
      return ApiResponse.error(res, 'Admin account not found', 404);
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email: sanitizedEmail });
    if (!otpRecord) {
      return ApiResponse.error(res, 'OTP not found or has expired. Please start over.', 400);
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return ApiResponse.error(res, 'Too many wrong attempts. Please log in again.', 400);
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return ApiResponse.error(res, 'OTP has expired. Please log in again.', 400);
    }

    // Compare OTP
    const isMatch = await otpRecord.compareOTP(otp);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      return ApiResponse.error(
        res,
        `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
        400
      );
    }

    // OTP is valid — delete it immediately
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate tokens
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    admin.refreshToken = hashedRefreshToken;
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const payloadAdmin = {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      mustChangePassword: admin.mustChangePassword,
    };

    return ApiResponse.success(res, 'Admin login successful', {
      accessToken,
      user: payloadAdmin,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Logout — clear refresh token
 */
const logout = async (req, res, next) => {
  try {
    // Clear refresh token from user document
    const user = await User.findByIdAndUpdate(req.user._id, {
      refreshToken: null,
    });

    if (!user) {
      await Admin.findByIdAndUpdate(req.user._id, {
        refreshToken: null,
      });
    }

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return ApiResponse.success(res, 'Logged out successfully');
  } catch (error) {

    return ApiResponse.error(res, 'Logout failed', 500);
  }
};

/**
 * POST /api/auth/refresh-token
 * Refresh access token using the httpOnly cookie
 */
const refreshTokenHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return ApiResponse.error(res, 'Refresh token not found', 401);
    }

    // Verify JWT
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return ApiResponse.error(res, 'Invalid or expired refresh token', 401);
    }

    // Find user and compare stored hash
    let user = await User.findById(decoded.id);

    if (!user) {
      user = await Admin.findById(decoded.id);
    }

    if (!user || !user.refreshToken) {
      return ApiResponse.error(res, 'Invalid refresh token', 401);
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    if (tokenHash !== user.refreshToken) {
      return ApiResponse.error(res, 'Refresh token mismatch', 401);
    }

    // Issue new access token
    const newAccessToken = user.generateAccessToken();

    let payloadUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    if (user.role === 'student' || user.role === 'hr') {
      payloadUser = {
        ...payloadUser,
        department: user.department,
        usnNumber: user.usnNumber,
        yearOfStudy: user.yearOfStudy,
      };
    }

    return ApiResponse.success(res, 'Token refreshed', {
      accessToken: newAccessToken,
      user: payloadUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 * Send password reset link
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const sanitizedEmail = email.trim().toLowerCase();

    // ALWAYS return 200 — never confirm if email exists (security)
    const genericMessage = 'If an account with this email exists, a reset link has been sent.';

    let user = await Admin.findOne({ email: sanitizedEmail });

    if (!user) {
      user = await User.findOne({ email: sanitizedEmail });
    }

    if (!user) {
      return ApiResponse.success(res, genericMessage);
    }

    // Generate reset token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash and store token with expiry
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save({ validateBeforeSave: false });

    // Build reset URL
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    // Debug: Log reset link to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('-----------------------------------------');
      console.log('PASSWORD RESET LINK (DEV ONLY):');
      console.log(resetURL);
      console.log('-----------------------------------------');
    }

    // Send email
    try {
      await sendResetEmail(user.fullName, sanitizedEmail, resetURL);
    } catch (emailError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Failed to send reset email in dev:', emailError.message);
      } else {
        return ApiResponse.error(
          res,
          `Failed to send password reset email: ${emailError.message}. Please configure SMTP settings.`,
          500
        );
      }
    }

    return ApiResponse.success(res, genericMessage);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/validate-reset-token
 * Check if a reset token is valid
 */
const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    let user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      user = await Admin.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: Date.now() },
      });
    }

    if (!user) {
      return ApiResponse.error(res, 'Invalid or expired reset link', 400, { valid: false });
    }

    return ApiResponse.success(res, 'Token is valid', { valid: true, role: user.role });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    let user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      user = await Admin.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: Date.now() },
      });
    }

    if (!user) {
      return ApiResponse.error(res, 'Invalid or expired reset link', 400);
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    return ApiResponse.success(res, 'Password updated successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/update-verify-email
 * Update email for unverified user and send new OTP
 */
const updateVerifyEmail = async (req, res, next) => {
  try {
    const { oldEmail, newEmail } = req.body;

    // Check if new email is already in use by a VERIFIED user
    const existingVerifiedUser = await User.findOne({ email: newEmail, isVerified: true });
    if (existingVerifiedUser) {
      return ApiResponse.error(res, 'An account with this email already exists and is verified', 409);
    }

    // Find the unverified user with old email
    const user = await User.findOne({ email: oldEmail, isVerified: false });
    if (!user) {
      return ApiResponse.error(res, 'Unverified account with the old email not found', 404);
    }

    // Update user's email
    user.email = newEmail;
    await user.save();

    // Delete any existing OTPs for both emails to save storage
    await OTP.deleteMany({ email: { $in: [oldEmail, newEmail] } });

    // Generate and send new OTP
    const otp = generateOTP();
    await OTP.create({
      email: newEmail,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(user.fullName, newEmail, otp);

    return ApiResponse.success(res, 'Email updated and new OTP sent.', { email: newEmail });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/admin-change-password
 * Allows a logged-in admin (who has mustChangePassword: true) to change their password
 */
const adminChangePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Fetch fresh Admin document
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return ApiResponse.error(res, 'Admin account not found', 404);
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return ApiResponse.error(res, 'Incorrect current password', 400);
    }

    // Make sure new password is not the same
    const isSame = await admin.comparePassword(newPassword);
    if (isSame) {
      return ApiResponse.error(res, 'New password must be different from current password', 400);
    }

    // Update password
    admin.password = newPassword;
    admin.mustChangePassword = false;
    admin.refreshToken = null; // Invalidate refresh token for security
    await admin.save();

    return ApiResponse.success(res, 'Password changed successfully. Please log in again.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendOTP,
  updateVerifyEmail,
  login,
  adminLogin,
  adminVerifyOtp,
  logout,
  refreshTokenHandler,
  forgotPassword,
  validateResetToken,
  resetPassword,
  adminChangePassword,
};
