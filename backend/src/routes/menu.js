const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  getMenuItems, getCategories, getAllMenuItems,
  createMenuItem, updateMenuItem, deleteMenuItem,
} = require('../controllers/menuController');

// Public
router.get('/', getMenuItems);
router.get('/categories', getCategories);

// Admin
router.get('/admin/all', authenticateToken, getAllMenuItems);
router.post('/', authenticateToken, uploadSingle('photo'), createMenuItem);
router.put('/:id', authenticateToken, uploadSingle('photo'), updateMenuItem);
router.delete('/:id', authenticateToken, deleteMenuItem);

module.exports = router;
