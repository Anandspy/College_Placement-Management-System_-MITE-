const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for auth routes (login, register)
 * 100 requests per 15 minutes (configurable)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_LIMIT_MAX, 10) || 100,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for sensitive routes (forgot-password, resend-otp)
 * 3 requests per hour
 */
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General rate limiter for all API routes
 * 500 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, sensitiveLimiter, apiLimiter };
