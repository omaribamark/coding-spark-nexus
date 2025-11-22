const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Get unread verdict count
router.get('/unread-verdicts', authenticate, notificationController.getUnreadVerdictCount);

// Mark verdict as read
router.post('/verdicts/:claimId/read', authenticate, notificationController.markVerdictAsRead);

module.exports = router;
