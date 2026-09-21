const GroundReport = require('./ground-report.model');

/**
 * Ground Report Service - Business Logic for Submit & Verify Ground Hazard Report
 */
class GroundReportService {
  /**
   * Submit a new ground hazard report
   * TODO: Main Flow - Save ground hazard report to database and trigger verification pipeline.
   * TODO: Exception Flow - Throw validation error if location coordinates are invalid.
   */
  async submitReport(data) {
    const report = new GroundReport(data);
    return await report.save();
  }

  /**
   * Fetch all ground reports
   */
  async getAllReports() {
    return await GroundReport.find().sort({ createdAt: -1 });
  }

  /**
   * Verify ground hazard report
   * TODO: Alternate Flow - Officer verifies report accuracy and updates status to VERIFIED.
   */
  async verifyReport(id, status) {
    return await GroundReport.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }
}

module.exports = new GroundReportService();
