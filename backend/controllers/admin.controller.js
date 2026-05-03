const User = require('../models/User.model');
const Drive = require('../models/Drive.model');
const Notice = require('../models/Notice.model');

/**
 * @desc    Get dashboard statistics for admin overview
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeDrives = await Drive.countDocuments({ status: 'open' });
    const pendingNotices = await Notice.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeDrives,
        pendingNotices,
      },
    });
  } catch (error) {
    next(error);
  }
};
