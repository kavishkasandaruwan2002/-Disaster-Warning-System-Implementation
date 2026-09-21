const express = require('express');
const router = express.Router();
const controller = require('./resource-coordination.controller');
const { addResourceValidation } = require('./resource-coordination.validation');
const validateRequest = require('../../shared/middleware/validateRequest');

router.post('/', addResourceValidation, validateRequest, controller.addResource);
router.get('/', controller.getResources);
router.patch('/:id/dispatch', controller.dispatchResource);

module.exports = router;
