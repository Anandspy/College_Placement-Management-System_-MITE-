const Application = require('../models/Application.model');
const Drive = require('../models/Drive.model');
const StudentProfile = require('../models/StudentProfile.model');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Apply to a placement drive
 * POST /api/applications/apply/:driveId
 */
exports.applyToDrive = async (req, res, next) => {
  try {
    const { driveId } = req.params;
    const studentId = req.user.id;

    // 1. Check if drive exists and is open
    const drive = await Drive.findById(driveId);
    if (!drive) {
      return ApiResponse.error(res, 'Drive not found', 404);
    }

    if (drive.status !== 'open') {
      return ApiResponse.error(res, `This drive is currently ${drive.status} and not accepting applications.`, 400);
    }

    // 2. Check registration deadline
    if (new Date() > new Date(drive.registrationDeadline)) {
      return ApiResponse.error(res, 'Registration deadline has passed.', 400);
    }

    // 3. Check if already applied
    const existingApplication = await Application.findOne({ studentId, driveId });
    if (existingApplication) {
      return ApiResponse.error(res, 'You have already applied for this drive.', 400);
    }

    // 4. Fetch student profile and validate eligibility (Backend enforcement)
    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) {
      return ApiResponse.error(res, 'Student profile not found. Please complete your profile first.', 404);
    }

    // Logic similar to useEligibility hook
    if (profile.cgpa < drive.eligibility.minCgpa) {
      return ApiResponse.error(res, 'You do not meet the minimum CGPA requirement.', 400);
    }

    if (profile.backlogs > drive.eligibility.maxBacklogs) {
      return ApiResponse.error(res, 'You exceed the maximum backlog limit.', 400);
    }

    // Branch check
    if (drive.eligibility.eligibleBranches.length > 0 && !drive.eligibility.eligibleBranches.includes(req.user.department)) {
      return ApiResponse.error(res, 'Your branch is not eligible for this drive.', 400);
    }

    if (!profile.resumeUrl) {
      return ApiResponse.error(res, 'Please upload your resume before applying.', 400);
    }

    // 5. Create application
    const application = await Application.create({
      studentId,
      driveId,
      resumeSnapshot: profile.resumeUrl
    });

    return ApiResponse.success(res, 'Application submitted successfully!', application, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applications for the logged-in student
 * GET /api/applications/my-applications
 */
exports.getStudentApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate('driveId', 'companyName jobRole ctc location status companyLogo')
      .sort({ appliedAt: -1 });

    return ApiResponse.success(res, 'Applications fetched successfully', applications);
  } catch (error) {
    next(error);
  }
};
