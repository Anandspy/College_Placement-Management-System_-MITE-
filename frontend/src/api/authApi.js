import axiosInstance from './axiosInstance';

// Register
export const registerUser = (data) =>
  axiosInstance.post('/auth/register', data);

// Verify Email
export const verifyEmail = (data) =>
  axiosInstance.post('/auth/verify-email', data);

// Resend OTP
export const resendOTP = (data) =>
  axiosInstance.post('/auth/resend-otp', data);

// Update Verify Email
export const updateVerifyEmail = (data) =>
  axiosInstance.put('/auth/update-verify-email', data);

// Login
export const loginUser = (data) =>
  axiosInstance.post('/auth/login', data);

// Admin Login (Step 1 — password check, sends OTP)
export const loginAdmin = (data) =>
  axiosInstance.post('/auth/admin-login', data);


// Logout
export const logoutUser = () =>
  axiosInstance.post('/auth/logout');

// Refresh Token
export const refreshToken = (storedRefreshToken) =>
  axiosInstance.post('/auth/refresh-token', { refreshToken: storedRefreshToken });

// Forgot Password
export const forgotPassword = (data) =>
  axiosInstance.post('/auth/forgot-password', data);

// Validate Reset Token
export const validateResetToken = (data) =>
  axiosInstance.post('/auth/validate-reset-token', data);

// Reset Password
export const resetPassword = (data) =>
  axiosInstance.post('/auth/reset-password', data);

// Admin Change Password (for forced password reset)
export const adminChangePassword = (data) =>
  axiosInstance.post('/auth/admin-change-password', data);
