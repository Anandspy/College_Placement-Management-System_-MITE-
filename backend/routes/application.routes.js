const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { verifyAccessToken, restrictToRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

// All application routes are protected
router.use(verifyAccessToken);

router.post('/apply/:driveId', restrictToRoles(ROLES.STUDENT), applicationController.applyToDrive);
router.get('/my-applications', restrictToRoles(ROLES.STUDENT), applicationController.getStudentApplications);

// Admin/HR Routes
router.get('/drive/:driveId', restrictToRoles(ROLES.ADMIN, ROLES.HR), applicationController.getDriveApplications);
router.patch('/:applicationId/status', restrictToRoles(ROLES.ADMIN, ROLES.HR), applicationController.updateApplicationStatus);

module.exports = router;
