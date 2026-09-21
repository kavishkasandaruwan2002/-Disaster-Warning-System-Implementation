const { body } = require('express-validator');

const createWarningValidation = [
  body('title').notEmpty().withMessage('Warning title is required'),
  body('hazardType').notEmpty().withMessage('Hazard type is required'),
  body('issuedBy').notEmpty().withMessage('Issuer details required')
];

module.exports = {
  createWarningValidation
};
