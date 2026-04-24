const { validationResult } = require('express-validator');
const StudentProfile = require('../models/StudentProfile.model');
const ApiResponse = require('../utils/ApiResponse');
const cloudinary = require('../config/cloudinary');

// ── Whitelist of updatable fields ───────────────────────────────
// Prevents clients from injecting fields like userId, resumeUrl, etc.
const ALLOWED_FIELDS = [
  'phone',
  'dateOfBirth',
  'gender',
  'address',
  'tenthPercentage',
  'tenthBoard',
  'tenthPassingYear',
  'twelfthPercentage',
  'twelfthBoard',
  'twelfthPassingYear',
  'cgpa',
  'backlogs',
  'skills',
  'projects',
  'certifications',
  'linkedIn',
  'github',
];

/**
 * Sanitize the request body — only allow whitelisted fields.
 */
const sanitizeUpdate = (body) => {
  const clean = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) {
      clean[key] = body[key];
    }
  }
  return clean;
};

/**
 * GET /api/profile/me
 * Fetch the current student's profile.
 * Auto-creates an empty profile shell if none exists.
 */
const getMyProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!profile) {
      // Auto-create an empty profile linked to this user
      profile = await StudentProfile.create({ userId: req.user._id });
    }

    return ApiResponse.success(res, 'Profile fetched successfully', {
      profile,
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return ApiResponse.error(res, 'Failed to fetch profile', 500);
  }
};

/**
 * PUT /api/profile/me
 * Update the current student's profile (partial update).
 * Only whitelisted fields are accepted.
 * The profile completion percentage is recalculated automatically via the pre-save hook.
 */
const updateMyProfile = async (req, res) => {
  try {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', 400, errors.array());
    }

    // Sanitize — strip out any fields not in the whitelist
    const updateData = sanitizeUpdate(req.body);

    if (Object.keys(updateData).length === 0) {
      return ApiResponse.error(res, 'No valid fields provided for update', 400);
    }

    // Find or create profile
    let profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: req.user._id });
    }

    // Apply updates to the document (so pre-save hook fires)
    Object.assign(profile, updateData);

    // Save — triggers pre-save hook which recalculates profileComplete
    await profile.save();

    return ApiResponse.success(res, 'Profile updated successfully', {
      profile,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return ApiResponse.error(res, messages.join('. '), 400);
    }

    return ApiResponse.error(res, 'Failed to update profile', 500);
  }
};

/**
 * POST /api/profile/resume
 * Upload resume (PDF) to Cloudinary
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, 'No file uploaded', 400);
    }

    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ userId: req.user._id });
    }

    // Delete existing old resume from Cloudinary
    if (profile.resumePublicId) {
      await cloudinary.uploader.destroy(profile.resumePublicId);
    }

    // Update profile with new resume info
    profile.resumeUrl = req.file.path;
    profile.resumePublicId = req.file.filename;

    await profile.save();

    return ApiResponse.success(res, 'Resume uploaded successfully', {
      resumeUrl: profile.resumeUrl,
    });
  } catch (error) {
    console.error('Upload resume error:', error.message);
    return ApiResponse.error(res, 'Failed to upload resume', 500);
  }
};

/**
 * DELETE /api/profile/resume
 * Remove resume from Cloudinary & clear fields
 */
const deleteResume = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    
    if (!profile || !profile.resumePublicId) {
      return ApiResponse.error(res, 'No resume found to delete', 404);
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(profile.resumePublicId);

    profile.resumeUrl = '';
    profile.resumePublicId = '';
    await profile.save();

    return ApiResponse.success(res, 'Resume deleted successfully');
  } catch (error) {
    console.error('Delete resume error:', error.message);
    return ApiResponse.error(res, 'Failed to delete resume', 500);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  deleteResume,
};
