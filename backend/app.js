const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const driveRoutes = require('./routes/drive.routes');
const applicationRoutes = require('./routes/application.routes');
const noticeRoutes = require('./routes/notice.routes');
const adminRoutes = require('./routes/admin.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Security headers
app.use(helmet());

// CORS — whitelist frontend URL
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies
  })
);

// Request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CPMS API is running',
    version: '1.0.0',
  });
});

const { apiLimiter } = require('./middleware/rateLimiter');

// API Routes
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
