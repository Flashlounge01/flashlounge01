const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { createReservation, getAllReservations, updateReservationStatus, deleteReservation } = require('../controllers/reservationsController');

// Public
router.post('/', createReservation);

// Admin
router.get('/', authenticateToken, getAllReservations);
router.put('/:id/status', authenticateToken, updateReservationStatus);
router.delete('/:id', authenticateToken, deleteReservation);

module.exports = router;
