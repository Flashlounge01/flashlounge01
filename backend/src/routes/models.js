const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  getActiveModels, initiateVote, handlePaymentWebhook, verifyPayment,
  getAllModels, createModel, updateModel, deleteModel, getModelVotes, resetModelVotes,
} = require('../controllers/modelsController');

// Public
router.get('/', getActiveModels);
router.post('/:model_id/vote', initiateVote);
router.get('/verify/:reference', verifyPayment);

// Webhook (no auth - verified via signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handlePaymentWebhook);

// Admin
router.get('/admin/all', authenticateToken, getAllModels);
router.post('/', authenticateToken, uploadSingle('photo'), createModel);
router.put('/:id', authenticateToken, uploadSingle('photo'), updateModel);
router.delete('/:id', authenticateToken, deleteModel);
router.get('/:id/votes', authenticateToken, getModelVotes);
router.post('/:id/reset', authenticateToken, resetModelVotes);

module.exports = router;
