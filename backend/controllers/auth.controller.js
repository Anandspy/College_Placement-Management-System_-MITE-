const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User.model');
const OTP = require('../models/OTP.model');
const generateOTP = require('../utils/generateOTP');
const ApiResponse = require('../utils/ApiResponse');
const { sendOTPEmail, sendResetEmail } = require('../services/email.service');

/**
 * POST /api/auth/register
 * Register a new student account
 */
const register = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', 400, errors.array());
    }

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
    await sendOTPEmail(fullName, email, otp);

    return ApiResponse.success(
      res,
      'Account created successfully. Please verify your email.',
      { email: user.email },
      201
    );
  } catch (error) {
    return ApiResponse.error(res, 'Registration failed. Please try again.', 500);
  }
};

/**
 * POST /api/auth/verify-email
 * Verify email with OTP
 */
const verifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', 400, errors.array());
    }

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
    return ApiResponse.error(res, 'Verification failed. Please try again.', 500);
  }
};

/**
 * POST /api/auth/resend-otp
 * Resend OTP for email verification
 */
const resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', 400, errors.array());
    }

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
    await sendOTPEmail(user.fullName, email, otp);

    return ApiResponse.success(res, 'OTP has been resent to your email.');
  } catch (error) {
    return ApiResponse.error(res, 'Failed to resend OTP. Please try again.', 500);
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', 400, errors.array());
    }

    const { email, password } = req.body;

    // Find user — generic error if not found (security)
    const user = await User.findOne({ email });

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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ApiResponse.success(res, 'Login successful', {
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        usnNumber: user.usnNumber,
      },
    });
  } catch (error) {
    return ApiResponse.error(res, 'Login failed. Please try again.', 500);
  }
};

/**
 * POST /api/auth/logout
 * Logout — clear refresh token
 */
const logout = async (req, res) => {
  try {
    // Clear refresh token from user document
    await User.findByIdAndUpdate(req.user._id, {
      refreshToken: null,
    });

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
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
const refreshTokenHandler = async (req, res) => {
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
    const user = await User.findById(decoded.id);

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

    return ApiResponse.success(res, 'Token refreshed', {
      accessToken: newAccessToken,
    });
  } catch (error) {

    return ApiResponse.error(res, 'Token refresh failed', 500);
  }
};

/**
 * POST /api/auth/forgot-password
 * Send password reset link
 */
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', 400, errors.array());
    }

    const { email } = req.body;

    // ALWAYS return 200 — never confirm if email exists (security)
    const genericMessage = 'If an account with this email exists, a reset link has been sent.';

    const user = await User.findOne({ email });

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

    // Send email
    await sendResetEmail(user.fullName, email, resetURL);

    return ApiResponse.success(res, genericMessage);
  } catch (error) {

    return ApiResponse.error(res, 'Failed to process request. Please try again.', 500);
  }
};

/**
 * POST /api/auth/validate-reset-token
 * Check if a reset token is valid
 */
const validateResetToken = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', 400, errors.array());
    }

    const { token } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return ApiResponse.error(res, 'Invalid or expired reset link', 400, { valid: false });
    }

    return ApiResponse.success(res, 'Token is valid', { valid: true });
  } catch (error) {

    return ApiResponse.error(res, 'Validation failed', 500);
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', 400, errors.array());
    }

    const { token, newPassword } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

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

    return ApiResponse.error(res, 'Password reset failed. Please try again.', 500);
  }
};

/**
 * PUT /api/auth/update-verify-email
 * Update email for unverified user and send new OTP
 */
const updateVerifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', 400, errors.array());
    }

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
    return ApiResponse.error(res, 'Failed to update email. Please try again.', 500);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendOTP,
  updateVerifyEmail,
  login,
  logout,
  refreshTokenHandler,
  forgotPassword,
  validateResetToken,
  resetPassword,
};
