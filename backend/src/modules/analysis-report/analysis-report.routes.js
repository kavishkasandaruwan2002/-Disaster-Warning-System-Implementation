const express = require('express');
const router = express.Router();
const controller = require('./analysis-report.controller');
const { generateReportValidation } = require('./analysis-report.validation');
const validateRequest = require('../../shared/middleware/validateRequest');

router.post('/', generateReportValidation, validateRequest, controller.generateReport);
router.get('/', controller.getReports);
router.get('/:id', controller.getReportById);

module.exports = router;
