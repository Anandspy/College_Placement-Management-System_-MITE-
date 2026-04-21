const express = require('express');
const router = express.Router();
const {
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
} = require('../validators/auth.validators');
const { verifyAccessToken } = require('../middleware/auth.middleware');
const { authLimiter, sensitiveLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/verify-email', verifyEmailValidation, verifyEmail);
router.post('/resend-otp', sensitiveLimiter, resendOTPValidation, resendOTP);
router.put('/update-verify-email', sensitiveLimiter, updateVerifyEmailValidation, updateVerifyEmail);
router.post('/login', authLimiter, loginValidation, login);
router.post('/refresh-token', refreshTokenHandler);
router.post('/forgot-password', sensitiveLimiter, forgotPasswordValidation, forgotPassword);
router.post('/validate-reset-token', validateResetTokenValidation, validateResetToken);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Protected routes
router.post('/logout', verifyAccessToken, logout);

module.exports = router;
