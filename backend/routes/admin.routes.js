const express = require('express');
const { getDashboardStats, getAllStudents, getStudentById } = require('../controllers/admin.controller');
const { verifyAccessToken, restrictToRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(verifyAccessToken);
router.use(restrictToRoles('admin', 'super-admin'));

// Route: /api/admin/stats
router.get('/stats', getDashboardStats);

// Route: /api/admin/students
router.get('/students', getAllStudents);

// Route: /api/admin/students/:id
router.get('/students/:id', getStudentById);

module.exports = router;
