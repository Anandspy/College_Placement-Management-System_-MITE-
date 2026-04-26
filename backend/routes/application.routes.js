const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { verifyAccessToken, restrictToRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

// All application routes are protected
router.use(verifyAccessToken);

router.post('/apply/:driveId', restrictToRoles(ROLES.STUDENT), applicationController.applyToDrive);
router.get('/my-applications', restrictToRoles(ROLES.STUDENT), applicationController.getStudentApplications);

module.exports = router;
