const { body } = require('express-validator');

const createReportValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('reportedBy').notEmpty().withMessage('Reporter name/ID is required')
];

module.exports = {
  createReportValidation
};
