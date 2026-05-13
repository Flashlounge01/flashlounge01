const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { getEvents, getAllEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventsController');

// Public
router.get('/', getEvents);

// Admin
router.get('/admin/all', authenticateToken, getAllEvents);
router.post('/', authenticateToken, uploadSingle('photo'), createEvent);
router.put('/:id', authenticateToken, uploadSingle('photo'), updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

module.exports = router;
