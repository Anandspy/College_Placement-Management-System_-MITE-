const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Notice body is required'],
      maxlength: [5000, 'Body cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: ['General', 'Placement', 'Urgent'],
      default: 'General',
    },
    attachmentUrl: {
      type: String,
      default: null, // Cloudinary PDF URL
    },
    attachmentName: {
      type: String,
      default: null, // Display name e.g. "Resume_Template.pdf"
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Soft-delete: false = hidden from students
    },
  },
  {
    timestamps: true,
  }
);

// Only return active notices in queries by default
noticeSchema.pre(/^find/, function () {
  // Allow bypassing for admin queries by passing { isActive: { $exists: true } }
  if (this.getFilter().isActive === undefined) {
    this.where({ isActive: true });
  }
});

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
