const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Sanitize the filename for security
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.pdf$/i, '');
    return {
      folder: `cpms/resumes/${req.user._id}`,
      format: 'pdf', // Cloudinary will automatically handle it as the correct resource type
      public_id: `${Date.now()}-${sanitizedName}`
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

// 2MB size limit for PDFs
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.(png|jpg|jpeg)$/i, '');
    return {
      folder: 'cpms/logos',
      allowedFormats: ['jpg', 'png', 'jpeg'],
      public_id: `${Date.now()}-${sanitizedName}`
    };
  },
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

module.exports = {
  upload,
  uploadImage
};
