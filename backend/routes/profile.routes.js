const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  deleteResume,
} = require('../controllers/profile.controller');
const {
  updateProfileValidation,
} = require('../validators/profile.validators');
const { verifyAccessToken } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { upload } = require('../middleware/upload.middleware');

// All profile routes require authentication + student role
router.use(verifyAccessToken);
router.use(requireRole('student'));

// GET  /api/profile/me — Fetch current student's profile
router.get('/me', getMyProfile);

// PUT  /api/profile/me — Update current student's profile
router.put('/me', updateProfileValidation, validateRequest, updateMyProfile);

// POST /api/profile/resume — Upload resume
router.post(
  '/resume',
  (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File size too large. Maximum size is 2MB', errors: null });
        }
        return res.status(400).json({ success: false, message: err.message, errors: null });
      }
      next();
    });
  },
  uploadResume
);

// DELETE /api/profile/resume — Delete resume
router.delete('/resume', deleteResume);

module.exports = router;
