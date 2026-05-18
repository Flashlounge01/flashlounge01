const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'flashlounge',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm', 'm4v', '3gp', 'ogv'],
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

module.exports = { cloudinary, upload };
