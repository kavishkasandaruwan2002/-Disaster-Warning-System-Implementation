const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.error(res, 'Validation Error', 400, errors.array());
  }
  next();
};

module.exports = validateRequest;
