const Notice = require('../models/Notice.model');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Create a new notice
 * @route   POST /api/notices
 * @access  Private (Admin / HR)
 */
exports.createNotice = async (req, res, next) => {
  try {
    const { title, body, category, attachmentUrl, attachmentName } = req.body;

    const notice = await Notice.create({
      title,
      body,
      category,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      postedBy: req.user.id,
    });

    // Populate postedBy for the response
    await notice.populate('postedBy', 'fullName role');

    return ApiResponse.success(res, 'Notice created successfully', notice, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active notices (with optional filtering & limit)
 * @route   GET /api/notices
 * @access  Private (All logged-in users)
 * @query   category=Urgent|Placement|General, limit=3, page=1
 */
exports.getAllNotices = async (req, res, next) => {
  try {
    const filter = {}; // isActive: true is applied automatically by pre-find hook

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const limit = parseInt(req.query.limit, 10) || 0;
    const page  = parseInt(req.query.page, 10)  || 1;
    const skip  = limit > 0 ? (page - 1) * limit : 0;

    const query = Notice.find(filter)
      .populate('postedBy', 'fullName role')
      .sort({ createdAt: -1 });

    if (limit > 0) {
      query.skip(skip).limit(limit);
    }

    const [notices, total] = await Promise.all([
      query,
      Notice.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'Notices fetched successfully', {
      notices,
      total,
      page,
      pages: limit > 0 ? Math.ceil(total / limit) : 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single notice by ID
 * @route   GET /api/notices/:id
 * @access  Private (All logged-in users)
 */
exports.getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate(
      'postedBy',
      'fullName role'
    );

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    return ApiResponse.success(res, 'Notice fetched successfully', notice);
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid notice ID format', 400);
    }
    next(error);
  }
};

/**
 * @desc    Update notice details
 * @route   PUT /api/notices/:id
 * @access  Private (Admin / HR)
 */
exports.updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'fullName role');

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    return ApiResponse.success(res, 'Notice updated successfully', notice);
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid notice ID format', 400);
    }
    next(error);
  }
};

/**
 * @desc    Soft-delete a notice (sets isActive = false)
 * @route   DELETE /api/notices/:id
 * @access  Private (Admin / HR)
 */
exports.deleteNotice = async (req, res, next) => {
  try {
    // Bypass the isActive pre-find hook to find the raw document
    const notice = await Notice.findOne({
      _id: req.params.id,
      isActive: { $exists: true },
    });

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    notice.isActive = false;
    await notice.save();

    return ApiResponse.success(res, 'Notice deleted successfully');
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid notice ID format', 400);
    }
    next(error);
  }
};
