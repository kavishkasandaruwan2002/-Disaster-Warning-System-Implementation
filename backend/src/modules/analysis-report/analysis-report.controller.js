const analysisService = require('./analysis-report.service');
const apiResponse = require('../../shared/utils/apiResponse');

const generateReport = async (req, res, next) => {
  try {
    // TODO: Main Flow - Generate post-event analysis report
    const report = await analysisService.generateReport(req.body);
    return apiResponse.success(res, 'Post-event analysis report generated successfully', report, 201);
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await analysisService.getAllReports();
    return apiResponse.success(res, 'Analysis reports retrieved successfully', reports);
  } catch (error) {
    next(error);
  }
};

const getReportById = async (req, res, next) => {
  try {
    const report = await analysisService.getReportById(req.params.id);
    if (!report) {
      return apiResponse.error(res, 'Analysis report not found', 404);
    }
    return apiResponse.success(res, 'Analysis report details retrieved successfully', report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateReport,
  getReports,
  getReportById
};
