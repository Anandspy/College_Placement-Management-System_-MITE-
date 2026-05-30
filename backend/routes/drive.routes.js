const express = require('express');
const {
  createDrive,
  getAllDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
} = require('../controllers/drive.controller');
const { verifyAccessToken, restrictToRoles } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest.middleware');
const {
  createDriveValidation,
  updateDriveValidation,
} = require('../validators/drive.validators');

const router = express.Router();

// Apply verifyAccessToken to all routes
router.use(verifyAccessToken);

// Route: /api/drives
router
  .route('/')
  .get(getAllDrives) // Public/Students
  .post(restrictToRoles('admin', 'hr'), createDriveValidation, validateRequest, createDrive); // Admin/HR only

// Route: /api/drives/:id
router
  .route('/:id')
  .get(getDriveById) // Public/Students
  .patch(restrictToRoles('admin', 'hr'), updateDriveValidation, validateRequest, updateDrive) // Admin/HR only
  .delete(restrictToRoles('admin', 'hr'), deleteDrive); // Admin/HR only

module.exports = router;

