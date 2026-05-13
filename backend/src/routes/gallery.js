const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { getGallery, getGalleryCategories, uploadPhoto, deletePhoto } = require('../controllers/galleryController');

// Public
router.get('/', getGallery);
router.get('/categories', getGalleryCategories);

// Admin
router.post('/', authenticateToken, uploadSingle('photo'), uploadPhoto);
router.delete('/:id', authenticateToken, deletePhoto);

module.exports = router;
