const analysisReportService = require('./analysis-report.service');
const apiResponse = require('../../shared/utils/apiResponse');

exports.generateReport = async (req, res, next) => {
  try {
    const result = await analysisReportService.generateReport(req.body);
    const msg = result.noActivity
      ? 'No activity recorded in selected period. Created report with zero counts.'
      : 'Post-event analysis report generated successfully';
    return apiResponse.success(res, msg, result, 201);
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const reports = await analysisReportService.getReports();
    return apiResponse.success(res, 'Analysis reports retrieved successfully', reports);
  } catch (error) {
    next(error);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const reportData = await analysisReportService.getReportById(req.params.id);
    return apiResponse.success(res, 'Analysis report details retrieved', reportData);
  } catch (error) {
    next(error);
  }
};

exports.shareReport = async (req, res, next) => {
  try {
    const result = await analysisReportService.shareReport(req.params.id, req.body);
    return apiResponse.success(res, result.message, result);
  } catch (error) {
    next(error);
  }
};
