const groundReportService = require('./ground-report.service');
const apiResponse = require('../../shared/utils/apiResponse');

/**
 * Controller for Submit and Verify Ground Hazard Report
 */
const createReport = async (req, res, next) => {
  try {
    // TODO: Main Flow - Create ground hazard report
    const report = await groundReportService.submitReport(req.body);
    return apiResponse.success(res, 'Ground hazard report submitted successfully', report, 201);
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await groundReportService.getAllReports();
    return apiResponse.success(res, 'Ground hazard reports retrieved successfully', reports);
  } catch (error) {
    next(error);
  }
};

const verifyReport = async (req, res, next) => {
  try {
    // TODO: Alternate Flow - Verify ground hazard report
    const { status } = req.body;
    const report = await groundReportService.verifyReport(req.params.id, status);
    if (!report) {
      return apiResponse.error(res, 'Ground report not found', 404);
    }
    return apiResponse.success(res, 'Report status updated successfully', report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  verifyReport
};
