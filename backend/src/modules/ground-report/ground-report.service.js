const mongoose = require('mongoose');
const GroundReport = require('./ground-report.model');

/**
 * Service handling Ground Report business logic (UC2)
 */
class GroundReportService {
  calculateDistance(lat1, lng1, lat2, lng2) {
    return Math.sqrt(Math.pow(Number(lat1) - Number(lat2), 2) + Math.pow(Number(lng1) - Number(lng2), 2));
  }

  async findReport(id) {
    const strId = id ? id.toString() : '';
    const query = [];
    if (mongoose.Types.ObjectId.isValid(strId)) {
      query.push({ _id: new mongoose.Types.ObjectId(strId) });
    }
    query.push({ reportId: strId });

    const report = await GroundReport.findOne({ $or: query });
    if (!report) {
      const error = new Error('Ground report not found');
      error.statusCode = 404;
      throw error;
    }
    return report;
  }

  async submitReport(data) {
    const { hazardType, description, photoUrl, gpsLat, gpsLng, submittedBy, districtId } = data;

    if (!hazardType) {
      const error = new Error('hazardType is required');
      error.statusCode = 400;
      throw error;
    }

    if (!description || !districtId || gpsLat === undefined || gpsLng === undefined) {
      const error = new Error('Missing required fields for ground report');
      error.statusCode = 400;
      throw error;
    }

    const reportId = `REP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const recentReports = await GroundReport.find({
      hazardType,
      verificationStatus: { $in: ['PENDING', 'VERIFIED'] }
    });

    let corroboratingExistingReport = null;
    for (const report of recentReports) {
      const reportTime = new Date(report.submittedTime || report.createdAt);
      if (reportTime >= sixHoursAgo) {
        const dist = this.calculateDistance(gpsLat, gpsLng, report.gpsLat, report.gpsLng);
        if (dist <= 0.01) {
          corroboratingExistingReport = report;
          break;
        }
      }
    }

    const newReportData = {
      reportId,
      hazardType,
      description,
      photoUrl: photoUrl || '',
      gpsLat: Number(gpsLat),
      gpsLng: Number(gpsLng),
      submittedTime: new Date(),
      submittedBy: submittedBy || null,
      districtId,
      verificationStatus: 'PENDING',
      corroboratingReportIds: corroboratingExistingReport ? [corroboratingExistingReport._id] : []
    };

    const createdReport = await GroundReport.create(newReportData);

    let isCorroborating = false;
    let corroboratesWith = null;

    if (corroboratingExistingReport) {
      isCorroborating = true;
      corroboratesWith = corroboratingExistingReport.reportId;

      const existingDoc = await GroundReport.findById(corroboratingExistingReport._id);
      if (existingDoc) {
        if (!existingDoc.corroboratingReportIds) {
          existingDoc.corroboratingReportIds = [];
        }
        existingDoc.corroboratingReportIds.push(createdReport._id);
        await existingDoc.save();
      }
    }

    const report = await this.getReportById(createdReport._id.toString());
    return {
      report,
      isCorroborating,
      corroboratesWith
    };
  }

  async getReports({ district, status }) {
    const filter = {};
    if (district) {
      const strDist = district.toString();
      if (mongoose.Types.ObjectId.isValid(strDist)) {
        filter.districtId = new mongoose.Types.ObjectId(strDist);
      }
    }
    if (status) {
      filter.verificationStatus = status;
    }

    const reports = await GroundReport.find(filter).sort({ districtId: 1, submittedTime: -1 });

    for (const report of reports) {
      if (report.submittedBy) await report.populate('submittedBy');
      if (report.districtId) await report.populate('districtId');
      if (report.corroboratingReportIds && report.corroboratingReportIds.length > 0) {
        await report.populate('corroboratingReportIds');
      }
    }

    return reports;
  }

  async getReportById(id) {
    const report = await this.findReport(id);

    if (report.submittedBy) await report.populate('submittedBy');
    if (report.districtId) await report.populate('districtId');
    if (report.corroboratingReportIds && report.corroboratingReportIds.length > 0) {
      await report.populate('corroboratingReportIds');
    }

    return report;
  }

  async verifyReport(id, { severityLevel, verifiedBy }) {
    const report = await this.findReport(id);

    report.verificationStatus = 'VERIFIED';
    report.verifiedTime = new Date();
    report.verifiedBy = verifiedBy || 'Duty Officer';
    report.severityLevel = severityLevel || 'LOW';

    if (severityLevel === 'HIGH') {
      console.log('Flagged for escalation - extension point of UC1');
    }

    await report.save();
    return this.getReportById(report._id.toString());
  }

  async rejectReport(id, { rejectionReason }) {
    const report = await this.findReport(id);

    if (!rejectionReason) {
      const error = new Error('Rejection reason is required');
      error.statusCode = 400;
      throw error;
    }

    report.verificationStatus = 'REJECTED';
    report.rejectionReason = rejectionReason;
    await report.save();

    return this.getReportById(report._id.toString());
  }

  async requestInfo(id) {
    const report = await this.findReport(id);
    report.verificationStatus = 'NEEDS_MORE_INFO';
    await report.save();

    return this.getReportById(report._id.toString());
  }

  async addEvidence(id, { photoUrl, comment }) {
    const report = await this.findReport(id);

    report.evidenceHistory.push({
      photoUrl: photoUrl || '',
      comment: comment || '',
      timestamp: new Date()
    });
    report.verificationStatus = 'PENDING';
    await report.save();

    return this.getReportById(report._id.toString());
  }
}

module.exports = new GroundReportService();
