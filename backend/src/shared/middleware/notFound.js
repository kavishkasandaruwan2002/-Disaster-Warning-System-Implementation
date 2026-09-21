const apiResponse = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  return apiResponse.error(res, `Route Not Found - ${req.originalUrl}`, 404);
};

module.exports = notFound;
