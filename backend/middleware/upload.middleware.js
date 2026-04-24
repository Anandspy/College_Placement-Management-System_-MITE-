const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: `cpms/resumes/${req.user._id}`,
      format: 'pdf',
      public_id: `${Date.now()}-${file.originalname.replace(/\.pdf$/i, '')}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only pdf files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// 2MB size limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = upload;
