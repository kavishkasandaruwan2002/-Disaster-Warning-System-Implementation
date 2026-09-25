const request = require('supertest');
const app = require('../../../app');
const setupTestDB = require('../../../testSetup');
const { District, Organisation } = require('../../../shared/models');
const HazardAlert = require('../../hazard-warning/hazard-warning.model');
const GroundReport = require('../../ground-report/ground-report.model');
const { Shelter } = require('../../resource-coordination/resource-coordination.model');
const AnalysisReport = require('../analysis-report.model');

setupTestDB();

describe('Post-Event Analysis Report Module API (UC4)', () => {
  let district, org1, org2;

  beforeEach(async () => {
    district = await District.create({ districtId: 'DIST-AR-1', name: 'Analysis District' });
    org1 = await Organisation.create({ orgId: 'ORG-AR-1', name: 'Org 1', type: 'GovernmentBody' });
    org2 = await Organisation.create({ orgId: 'ORG-AR-2', name: 'Org 2', type: 'NGO' });
  });

  it('should generate report with data present in date range', async () => {
    const periodFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const periodTo = new Date();

    await HazardAlert.create({
      alertId: 'ALT-REPORT',
      hazardType: 'Flood',
      severityLevel: 'Warning',
      targetDistrictIds: [district._id],
      message: 'Test warning',
      issuedTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    await GroundReport.create({
      reportId: 'REP-ANALYSIS',
      hazardType: 'Flood',
      description: 'Verified flood',
      gpsLat: 6.9,
      gpsLng: 79.8,
      submittedTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      districtId: district._id,
      verificationStatus: 'VERIFIED'
    });

    await Shelter.create({
      shelterId: 'S-ANALYSIS',
      name: 'Active Shelter',
      location: 'Loc',
      capacity: 100,
      districtId: district._id,
      ownerOrgId: org1._id,
      status: 'OPEN'
    });

    const res = await request(app)
      .post('/api/analysis-reports/generate')
      .send({
        periodFrom: periodFrom.toISOString(),
        periodTo: periodTo.toISOString(),
        districtFilter: district._id.toString(),
        hazardTypeFilter: 'Flood'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.report.alertsIssuedCount).toBe(1);
    expect(res.body.data.report.reportsVerifiedCount).toBe(1);
    expect(res.body.data.report.sheltersActivatedCount).toBe(1);
    expect(res.body.data.noActivity).toBe(false);
  });

  it('should handle zero-count path when no activity is found and return noActivity: true', async () => {
    const periodFrom = new Date('2020-01-01');
    const periodTo = new Date('2020-01-07');

    const res = await request(app)
      .post('/api/analysis-reports/generate')
      .send({
        periodFrom: periodFrom.toISOString(),
        periodTo: periodTo.toISOString()
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.report.alertsIssuedCount).toBe(0);
    expect(res.body.data.report.reportsVerifiedCount).toBe(0);
    expect(res.body.data.report.sheltersActivatedCount).toBe(0);
    expect(res.body.data.noActivity).toBe(true);
  });

  it('should append partner organisations correctly when sharing report', async () => {
    const report = await AnalysisReport.create({
      reportId: 'REPORT-SHARE-TEST',
      periodFrom: new Date(),
      periodTo: new Date(),
      citizensReachedCount: 100,
      alertsIssuedCount: 2,
      reportsVerifiedCount: 3,
      sheltersActivatedCount: 1,
      sharedWithOrgIds: [org1._id]
    });

    const res = await request(app)
      .post(`/api/analysis-reports/${report._id}/share`)
      .send({ orgIds: [org2._id.toString()] });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.sharedWithOrgIds.length).toBe(2);
    expect(res.body.data.downloadUrl).toContain('/downloads/report-');
  });
});
