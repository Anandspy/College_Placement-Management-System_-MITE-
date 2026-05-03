const express = require('express');
const { getDashboardStats } = require('../controllers/admin.controller');
const { verifyAccessToken, restrictToRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(verifyAccessToken);
router.use(restrictToRoles('admin', 'super-admin'));

// Route: /api/admin/stats
router.get('/stats', getDashboardStats);

module.exports = router;
