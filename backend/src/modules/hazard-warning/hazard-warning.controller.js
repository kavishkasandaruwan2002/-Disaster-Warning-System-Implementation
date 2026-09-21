const hazardWarningService = require('./hazard-warning.service');
const apiResponse = require('../../shared/utils/apiResponse');

const createWarning = async (req, res, next) => {
  try {
    // TODO: Main Flow - Issue new hazard warning
    const warning = await hazardWarningService.issueWarning(req.body);
    return apiResponse.success(res, 'Hazard warning issued successfully', warning, 201);
  } catch (error) {
    next(error);
  }
};

const getWarnings = async (req, res, next) => {
  try {
    const warnings = await hazardWarningService.getActiveWarnings();
    return apiResponse.success(res, 'Active warnings retrieved successfully', warnings);
  } catch (error) {
    next(error);
  }
};

const revokeWarning = async (req, res, next) => {
  try {
    // TODO: Alternate Flow - Revoke active warning
    const warning = await hazardWarningService.revokeWarning(req.params.id);
    if (!warning) {
      return apiResponse.error(res, 'Hazard warning not found', 404);
    }
    return apiResponse.success(res, 'Hazard warning revoked successfully', warning);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWarning,
  getWarnings,
  revokeWarning
};
