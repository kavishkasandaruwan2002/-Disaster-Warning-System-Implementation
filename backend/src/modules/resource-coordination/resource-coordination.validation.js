const { body } = require('express-validator');

const addResourceValidation = [
  body('resourceName').notEmpty().withMessage('Resource name is required'),
  body('resourceType').notEmpty().withMessage('Resource type is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number')
];

module.exports = {
  addResourceValidation
};
