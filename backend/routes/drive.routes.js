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
const { uploadImage } = require('../middleware/upload.middleware');

const router = express.Router();

const parseEligibility = (req, res, next) => {
  if (req.body && req.body.eligibility && typeof req.body.eligibility === 'string') {
    try {
      req.body.eligibility = JSON.parse(req.body.eligibility);
    } catch(e) {}
  }
  next();
};

// Apply verifyAccessToken to all routes
router.use(verifyAccessToken);

// Route: /api/drives
router
  .route('/')
  .get(getAllDrives) // Public/Students
  .post(restrictToRoles('admin', 'hr'), uploadImage.single('companyLogo'), parseEligibility, ...createDriveValidation, validateRequest, createDrive); // Admin/HR only

// Route: /api/drives/:id
router
  .route('/:id')
  .get(getDriveById) // Public/Students
  .patch(restrictToRoles('admin', 'hr'), uploadImage.single('companyLogo'), parseEligibility, ...updateDriveValidation, validateRequest, updateDrive) // Admin/HR only
  .delete(restrictToRoles('admin', 'hr'), deleteDrive); // Admin/HR only

module.exports = router;

 
