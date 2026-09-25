const express = require('express');
const router = express.Router();
const groundReportController = require('./ground-report.controller');

router.post('/', groundReportController.submitReport);
router.get('/', groundReportController.getReports);
router.get('/:id', groundReportController.getReportById);
router.patch('/:id/verify', groundReportController.verifyReport);
router.patch('/:id/reject', groundReportController.rejectReport);
router.patch('/:id/request-info', groundReportController.requestInfo);
router.patch('/:id/add-evidence', groundReportController.addEvidence);

module.exports = router;
