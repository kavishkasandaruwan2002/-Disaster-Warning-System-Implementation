const hazardWarningService = require('./hazard-warning.service');
const apiResponse = require('../../shared/utils/apiResponse');

exports.previewReach = async (req, res, next) => {
  try {
    const preview = await hazardWarningService.previewReach(req.body);
    return apiResponse.success(res, 'Estimated reach calculated', preview);
  } catch (error) {
    next(error);
  }
};

exports.issueWarning = async (req, res, next) => {
  try {
    const result = await hazardWarningService.issueWarning(req.body);
    return apiResponse.success(res, 'Hazard alert created and broadcast issued', result, 201);
  } catch (error) {
    next(error);
  }
};

exports.getActiveWarnings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const warnings = await hazardWarningService.getActiveWarnings(status);
    return apiResponse.success(res, 'Hazard warnings retrieved successfully', warnings);
  } catch (error) {
    next(error);
  }
};

exports.getWarningById = async (req, res, next) => {
  try {
    const warning = await hazardWarningService.getWarningById(req.params.id);
    return apiResponse.success(res, 'Hazard warning retrieved successfully', warning);
  } catch (error) {
    next(error);
  }
};

exports.escalateWarning = async (req, res, next) => {
  try {
    const result = await hazardWarningService.escalateWarning(req.params.id, req.body);
    return apiResponse.success(res, 'Hazard warning escalated successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.cancelWarning = async (req, res, next) => {
  try {
    const updated = await hazardWarningService.cancelWarning(req.params.id);
    return apiResponse.success(res, 'Hazard warning cancelled successfully', updated);
  } catch (error) {
    next(error);
  }
};

exports.getNotificationStats = async (req, res, next) => {
  try {
    const stats = await hazardWarningService.getNotificationStats(req.params.id);
    return apiResponse.success(res, 'Notification delivery statistics retrieved', stats);
  } catch (error) {
    next(error);
  }
};
