const { upload } = require('../../config/cloudinary');

// Wraps multer so upload errors return JSON instead of crashing to the global handler
const uploadSingle = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (!err) return next();
    console.error('Upload error:', err.message, err.stack || '');
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ error: err.message || 'File upload failed' });
  });
};

module.exports = { upload, uploadSingle };
