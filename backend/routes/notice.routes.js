const express = require('express');
const {
  createNotice,
  getAllNotices,
  getNoticeById,
  deleteNotice,
  updateNotice,
} = require('../controllers/notice.controller');
const { verifyAccessToken, restrictToRoles } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest.middleware');
const {
  createNoticeValidation,
  updateNoticeValidation,
} = require('../validators/notice.validators');

const router = express.Router();

// Apply token verification to all notice routes
router.use(verifyAccessToken);

// Route: /api/notices
router
  .route('/')
  .get(getAllNotices)                              // All logged-in users (students read)
  .post(restrictToRoles('admin', 'hr'), createNoticeValidation, validateRequest, createNotice); // Admin / HR only

// Route: /api/notices/:id
router
  .route('/:id')
  .get(getNoticeById)                              // All logged-in users
  .put(restrictToRoles('admin', 'hr'), updateNoticeValidation, validateRequest, updateNotice)     // Admin / HR only
  .delete(restrictToRoles('admin', 'hr'), deleteNotice); // Admin / HR only

module.exports = router;

