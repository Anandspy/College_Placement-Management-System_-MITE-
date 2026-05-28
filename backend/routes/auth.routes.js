const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/auth.controller');
const {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  resendOTPValidation,
  updateVerifyEmailValidation,
  forgotPasswordValidation,
  validateResetTokenValidation,
  resetPasswordValidation,
  adminChangePasswordValidation,
} = require('../validators/auth.validators');
const { verifyAccessToken } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest.middleware');
const { authLimiter, sensitiveLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, registerValidation, validateRequest, register);
router.post('/verify-email', verifyEmailValidation, validateRequest, verifyEmail);
router.post('/resend-otp', sensitiveLimiter, resendOTPValidation, validateRequest, resendOTP);
router.put('/update-verify-email', sensitiveLimiter, updateVerifyEmailValidation, validateRequest, updateVerifyEmail);
router.post('/login', authLimiter, loginValidation, validateRequest, login);
router.post('/admin-login', authLimiter, loginValidation, validateRequest, adminLogin);
router.post('/admin-verify-otp', sensitiveLimiter, adminVerifyOtp);
router.post('/refresh-token', refreshTokenHandler);
router.post('/forgot-password', sensitiveLimiter, forgotPasswordValidation, validateRequest, forgotPassword);
router.post('/validate-reset-token', validateResetTokenValidation, validateRequest, validateResetToken);
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

// Protected routes
router.post('/logout', verifyAccessToken, logout);
router.post('/admin-change-password', verifyAccessToken, adminChangePasswordValidation, validateRequest, adminChangePassword);

module.exports = router;
