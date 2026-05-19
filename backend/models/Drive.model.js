const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyLogo: {
      type: String,
      default: null, // Can store Cloudinary URL
    },
    companyDescription: {
      type: String,
      required: [true, 'Company description is required'],
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    ctc: {
      type: String, // e.g., "12 LPA", "Fixed 8 + 2 Variable"
      required: [true, 'CTC is required'],
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Internship', 'Internship + Full-time'],
      required: [true, 'Job type is required'],
    },
    eligibility: {
      minCgpa: {
        type: Number,
        default: 0,
      },
      minTenthPercent: {
        type: Number,
        default: 0,
      },
      minTwelfthPercent: {
        type: Number,
        default: 0,
      },
      maxBacklogs: {
        type: Number,
        default: 0, // 0 means no active backlogs allowed
      },
      eligibleBranches: [
        {
          type: String,
          enum: [
            'Aeronautical Engineering',
            'Artificial Intelligence & Machine Learning',
            'Civil Engineering',
            'Computer Science & Engineering',
            'Computer Science & Engineering (Artificial Intelligence & Machine Learning)',
            'Computer Science & Engineering (IoT & Cyber Security with Blockchain Technology)',
            'Electronics & Communication Engineering',
            'Information Science & Engineering',
            'Mechanical Engineering',
            'Mechatronics Engineering',
            'Robotics & Artificial Intelligence',
            'MCA (Master of Computer Applications)',
            'MBA (Master of Business Administration)',
            'M.Tech in Computer Science & Engineering',
            'M.Tech in Mechatronics',
          ],
        },
      ],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'open', 'closed'],
      default: 'upcoming',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for checking if registration is open
driveSchema.virtual('isRegistrationOpen').get(function () {
  return this.status === 'open' && new Date() <= this.registrationDeadline;
});

// Auto-update status based on dates (optional logic to run on save or fetch)
driveSchema.pre('save', function (next) {
  const now = new Date();
  if (this.status !== 'closed') {
    if (now > this.registrationDeadline) {
      this.status = 'closed';
    } else if (now >= this.createdAt && now <= this.registrationDeadline) {
      this.status = 'open'; // Assuming once created, it's open unless explicitly upcoming
    }
  }
  next();
});

// Allow virtuals in JSON
driveSchema.set('toJSON', { virtuals: true });
driveSchema.set('toObject', { virtuals: true });

// Only return active drives in queries by default
driveSchema.pre(/^find/, function (next) {
  // Allow bypassing for admin queries by passing { isActive: { $exists: true } }
  if (this.getFilter().isActive === undefined) {
    this.where({ isActive: true });
  }
  next();
});

const Drive = mongoose.model('Drive', driveSchema);

module.exports = Drive;
