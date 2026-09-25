const express = require('express');
const router = express.Router();
const hazardWarningController = require('./hazard-warning.controller');

router.post('/preview', hazardWarningController.previewReach);
router.post('/', hazardWarningController.issueWarning);
router.get('/', hazardWarningController.getActiveWarnings);
router.get('/:id', hazardWarningController.getWarningById);
router.patch('/:id/escalate', hazardWarningController.escalateWarning);
router.patch('/:id/cancel', hazardWarningController.cancelWarning);
router.get('/:id/notifications', hazardWarningController.getNotificationStats);

module.exports = router;
