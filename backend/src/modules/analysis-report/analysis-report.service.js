const AnalysisReport = require('./analysis-report.model');

/**
 * Analysis Report Service - Business Logic for Generate Post-Event Analysis Report
 */
class AnalysisReportService {
  /**
   * Generate post-event analysis report
   * TODO: Main Flow - Aggregate incident reports, warnings, and resource usage into a comprehensive summary.
   */
  async generateReport(data) {
    const report = new AnalysisReport(data);
    return await report.save();
  }

  /**
   * Get all post-event reports
   */
  async getAllReports() {
    return await AnalysisReport.find().sort({ createdAt: -1 });
  }

  /**
   * Get report by ID
   */
  async getReportById(id) {
    return await AnalysisReport.findById(id);
  }
}

module.exports = new AnalysisReportService();
