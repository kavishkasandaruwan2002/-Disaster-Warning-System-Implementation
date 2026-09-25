const express = require('express');
const router = express.Router();
const analysisReportController = require('./analysis-report.controller');

router.post('/generate', analysisReportController.generateReport);
router.get('/', analysisReportController.getReports);
router.get('/:id', analysisReportController.getReportById);
router.post('/:id/share', analysisReportController.shareReport);

module.exports = router;
