const Drive = require('../models/Drive.model');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Create a new drive
 * @route   POST /api/drives
 * @access  Private (Admin/HR)
 */
exports.createDrive = async (req, res, next) => {
  try {
    const driveData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const drive = await Drive.create(driveData);

    return ApiResponse.success(res, 'Drive created successfully', drive, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all drives (with optional filtering)
 * @route   GET /api/drives
 * @access  Private (Students, Admin, HR)
 */
exports.getAllDrives = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status && typeof req.query.status === 'string') {
      filter.status = req.query.status;
    }

    if (req.query.search && typeof req.query.search === 'string') {
      const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapeRegex(req.query.search), 'i');
      filter.$or = [
        { companyName: searchRegex },
        { jobRole: searchRegex }
      ];
    }

    const limit = parseInt(req.query.limit, 10) || 0;
    const page  = parseInt(req.query.page, 10)  || 1;
    const skip  = limit > 0 ? (page - 1) * limit : 0;

    const query = Drive.find(filter).sort({ createdAt: -1 });
    
    if (limit > 0) {
      query.skip(skip).limit(limit);
    }

    const [drives, total] = await Promise.all([
      query,
      Drive.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'Drives fetched successfully', {
      drives,
      total,
      page,
      pages: limit > 0 ? Math.ceil(total / limit) : 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single drive by ID
 * @route   GET /api/drives/:id
 * @access  Private (Students, Admin, HR)
 */
exports.getDriveById = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id);

    if (!drive) {
      return ApiResponse.error(res, 'Drive not found', 404);
    }

    return ApiResponse.success(res, 'Drive details fetched successfully', drive);
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid drive ID format', 400);
    }
    next(error);
  }
};

/**
 * @desc    Update drive details
 * @route   PATCH /api/drives/:id
 * @access  Private (Admin/HR)
 */
exports.updateDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!drive) {
      return ApiResponse.error(res, 'Drive not found', 404);
    }

    return ApiResponse.success(res, 'Drive updated successfully', drive);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a drive
 * @route   DELETE /api/drives/:id
 * @access  Private (Admin/HR)
 */
exports.deleteDrive = async (req, res, next) => {
  try {
    // Bypass the isActive pre-find hook to find the raw document
    const drive = await Drive.findOne({
      _id: req.params.id,
      isActive: { $exists: true },
    });

    if (!drive) {
      return ApiResponse.error(res, 'Drive not found', 404);
    }

    drive.isActive = false;
    await drive.save();

    return ApiResponse.success(res, 'Drive deleted successfully');
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid drive ID format', 400);
    }
    next(error);
  }
};
