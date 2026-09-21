const express = require('express');
const router = express.Router();
const controller = require('./hazard-warning.controller');
const { createWarningValidation } = require('./hazard-warning.validation');
const validateRequest = require('../../shared/middleware/validateRequest');

router.post('/', createWarningValidation, validateRequest, controller.createWarning);
router.get('/', controller.getWarnings);
router.patch('/:id/revoke', controller.revokeWarning);

module.exports = router;
