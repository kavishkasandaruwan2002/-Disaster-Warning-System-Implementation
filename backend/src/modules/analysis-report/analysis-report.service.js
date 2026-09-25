const AnalysisReport = require('./analysis-report.model');
const HazardAlert = require('../hazard-warning/hazard-warning.model');
const GroundReport = require('../ground-report/ground-report.model');
const { Shelter, ReliefSupply } = require('../resource-coordination/resource-coordination.model');
const { Notification } = require('../../shared/models');

/**
 * Service handling Post-Event Analysis Report business logic (UC4)
 */
class AnalysisReportService {
  /**
   * Generate post-event analysis report aggregating real collection metrics
   */
  async generateReport({ periodFrom, periodTo, districtFilter, hazardTypeFilter }) {
    if (!periodFrom || !periodTo) {
      const error = new Error('periodFrom and periodTo are required dates');
      error.statusCode = 400;
      throw error;
    }

    const startDate = new Date(periodFrom);
    const endDate = new Date(periodTo);

    // Build filter query for HazardAlerts
    const alertQuery = {
      issuedTime: { $gte: startDate, $lte: endDate }
    };
    if (hazardTypeFilter) alertQuery.hazardType = hazardTypeFilter;
    if (districtFilter) alertQuery.targetDistrictIds = districtFilter;

    const matchingAlerts = await HazardAlert.find(alertQuery);
    const alertsIssuedCount = matchingAlerts.length;

    // Count citizens reached via SENT notifications
    const alertIds = matchingAlerts.map(a => a._id);
    let citizensReachedCount = 0;
    if (alertIds.length > 0) {
      const uniqueCitizens = await Notification.distinct('citizenId', {
        hazardAlertId: { $in: alertIds },
        deliveryStatus: 'SENT'
      });
      citizensReachedCount = uniqueCitizens.length;
    }

    // Build filter query for GroundReports
    const reportQuery = {
      submittedTime: { $gte: startDate, $lte: endDate },
      verificationStatus: 'VERIFIED'
    };
    if (hazardTypeFilter) reportQuery.hazardType = hazardTypeFilter;
    if (districtFilter) reportQuery.districtId = districtFilter;

    const reportsVerifiedCount = await GroundReport.countDocuments(reportQuery);

    // Build filter query for Shelters
    const shelterQuery = { status: { $ne: 'NOT_ACTIVATED' } };
    if (districtFilter) shelterQuery.districtId = districtFilter;

    const sheltersActivatedCount = await Shelter.countDocuments(shelterQuery);

    const noActivity = (alertsIssuedCount === 0 && reportsVerifiedCount === 0 && sheltersActivatedCount === 0);

    const reportId = `REPORT-${Date.now()}`;

    const newReport = await AnalysisReport.create({
      reportId,
      generatedDate: new Date(),
      periodFrom: startDate,
      periodTo: endDate,
      districtFilter: districtFilter || null,
      hazardTypeFilter: hazardTypeFilter || '',
      citizensReachedCount,
      alertsIssuedCount,
      reportsVerifiedCount,
      sheltersActivatedCount,
      sharedWithOrgIds: []
    });

    const populated = await AnalysisReport.findById(newReport._id)
      .populate('districtFilter')
      .populate('sharedWithOrgIds');

    return {
      report: populated,
      noActivity
    };
  }

  /**
   * List all generated reports
   */
  async getReports() {
    const reports = await AnalysisReport.find()
      .sort({ generatedDate: -1 })
      .populate('districtFilter')
      .populate('sharedWithOrgIds');
    return reports;
  }

  /**
   * Get single report details including weekly alert breakdown and supply distribution stats
   */
  async getReportById(id) {
    let report = await AnalysisReport.findById(id)
      .populate('districtFilter')
      .populate('sharedWithOrgIds')
      .catch(() => null);

    if (!report) {
      report = await AnalysisReport.findOne({ reportId: id })
        .populate('districtFilter')
        .populate('sharedWithOrgIds');
    }

    if (!report) {
      const error = new Error('Analysis report not found');
      error.statusCode = 404;
      throw error;
    }

    // Compute weekly alert-count breakdown array
    const alertQuery = {
      issuedTime: { $gte: report.periodFrom, $lte: report.periodTo }
    };
    if (report.hazardTypeFilter) alertQuery.hazardType = report.hazardTypeFilter;
    if (report.districtFilter) alertQuery.targetDistrictIds = report.districtFilter._id || report.districtFilter;

    const alerts = await HazardAlert.find(alertQuery);

    // Group into 4 weeks
    const totalDays = Math.max(1, Math.ceil((report.periodTo - report.periodFrom) / (1000 * 60 * 60 * 24)));
    const daysPerWeek = Math.max(1, Math.ceil(totalDays / 4));

    const weeklyAlertBreakdown = [
      { week: 'Week 1', count: 0 },
      { week: 'Week 2', count: 0 },
      { week: 'Week 3', count: 0 },
      { week: 'Week 4', count: 0 }
    ];

    alerts.forEach(alert => {
      const dayDiff = Math.floor((alert.issuedTime - report.periodFrom) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.min(3, Math.floor(dayDiff / daysPerWeek));
      if (weekIndex >= 0 && weekIndex < 4) {
        weeklyAlertBreakdown[weekIndex].count++;
      }
    });

    // Compute relief supply distribution percentage per supplyType
    const supplyQuery = {};
    if (report.districtFilter) supplyQuery.districtId = report.districtFilter._id || report.districtFilter;

    const supplies = await ReliefSupply.find(supplyQuery);
    const supplyTypes = ['Food', 'Water', 'Medicine', 'ShelterMaterial'];

    const supplyDistribution = supplyTypes.map(type => {
      const matching = supplies.filter(s => s.supplyType === type);
      const totalQty = matching.reduce((acc, curr) => acc + curr.quantity, 0);
      const distQty = matching.reduce((acc, curr) => acc + curr.distributedQuantity, 0);
      const percentage = totalQty > 0 ? Math.round((distQty / totalQty) * 100) : 0;

      return {
        supplyType: type,
        totalQuantity: totalQty,
        distributedQuantity: distQty,
        distributionPercentage: percentage
      };
    });

    return {
      report,
      weeklyAlertBreakdown,
      supplyDistribution
    };
  }

  /**
   * Share report with partner organisations (appends orgIds)
   */
  async shareReport(id, { orgIds }) {
    let report = await AnalysisReport.findById(id).catch(() => null);
    if (!report) {
      report = await AnalysisReport.findOne({ reportId: id });
    }

    if (!report) {
      const error = new Error('Analysis report not found');
      error.statusCode = 404;
      throw error;
    }

    if (Array.isArray(orgIds)) {
      orgIds.forEach(orgId => {
        if (!report.sharedWithOrgIds.includes(orgId)) {
          report.sharedWithOrgIds.push(orgId);
        }
      });
      await report.save();
    }

    const updated = await AnalysisReport.findById(report._id).populate('sharedWithOrgIds');

    return {
      message: 'Report shared successfully with partner organisations',
      downloadUrl: `/downloads/report-${report.reportId}.pdf`,
      sharedWithOrgIds: updated.sharedWithOrgIds
    };
  }
}

module.exports = new AnalysisReportService();
