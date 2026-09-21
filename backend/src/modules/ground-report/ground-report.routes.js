const express = require('express');
const router = express.Router();
const controller = require('./ground-report.controller');
const { createReportValidation } = require('./ground-report.validation');
const validateRequest = require('../../shared/middleware/validateRequest');

router.post('/', createReportValidation, validateRequest, controller.createReport);
router.get('/', controller.getReports);
router.patch('/:id/verify', controller.verifyReport);

module.exports = router;
