const { body } = require('express-validator');

const generateReportValidation = [
  body('eventTitle').notEmpty().withMessage('Event title is required'),
  body('disasterType').notEmpty().withMessage('Disaster type is required'),
  body('affectedArea').notEmpty().withMessage('Affected area is required'),
  body('author').notEmpty().withMessage('Author name/ID is required')
];

module.exports = {
  generateReportValidation
};
