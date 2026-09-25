const groundReportService = require('./ground-report.service');
const apiResponse = require('../../shared/utils/apiResponse');

exports.submitReport = async (req, res, next) => {
  try {
    const result = await groundReportService.submitReport(req.body);
    const msg = result.isCorroborating
      ? `Report submitted and linked as corroborating report to ${result.corroboratesWith}`
      : 'Ground hazard report submitted successfully';
    return apiResponse.success(res, msg, result, 201);
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const { district, status } = req.query;
    const reports = await groundReportService.getReports({ district, status });
    return apiResponse.success(res, 'Ground reports retrieved successfully', reports);
  } catch (error) {
    next(error);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await groundReportService.getReportById(req.params.id);
    return apiResponse.success(res, 'Ground report details retrieved successfully', report);
  } catch (error) {
    next(error);
  }
};

exports.verifyReport = async (req, res, next) => {
  try {
    const updatedReport = await groundReportService.verifyReport(req.params.id, req.body);
    return apiResponse.success(res, 'Ground report verified successfully', updatedReport);
  } catch (error) {
    next(error);
  }
};

exports.rejectReport = async (req, res, next) => {
  try {
    const updatedReport = await groundReportService.rejectReport(req.params.id, req.body);
    return apiResponse.success(res, 'Ground report rejected', updatedReport);
  } catch (error) {
    next(error);
  }
};

exports.requestInfo = async (req, res, next) => {
  try {
    const updatedReport = await groundReportService.requestInfo(req.params.id);
    return apiResponse.success(res, 'Requested more information for report', updatedReport);
  } catch (error) {
    next(error);
  }
};

exports.addEvidence = async (req, res, next) => {
  try {
    const updatedReport = await groundReportService.addEvidence(req.params.id, req.body);
    return apiResponse.success(res, 'Evidence added and report reset to PENDING', updatedReport);
  } catch (error) {
    next(error);
  }
};
