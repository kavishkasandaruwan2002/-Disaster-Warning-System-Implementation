const request = require('supertest');
const app = require('../../../app');
const setupTestDB = require('../../../testSetup');
const { District, Citizen } = require('../../../shared/models');
const GroundReport = require('../ground-report.model');

setupTestDB();

describe('Ground Report Module API (UC2)', () => {
  let district, citizen;

  beforeEach(async () => {
    district = await District.create({
      districtId: 'DIST-TEST-1',
      name: 'Test District'
    });

    citizen = await Citizen.create({
      nationalId: '123456789V',
      name: 'Test Citizen',
      homeAddress: '123 Test St',
      districtId: district._id
    });
  });

  it('should successfully submit a new ground hazard report', async () => {
    const res = await request(app)
      .post('/api/ground-reports')
      .send({
        hazardType: 'Flood',
        description: 'Rising water near riverbank',
        photoUrl: 'flood_sample.jpg',
        gpsLat: 6.9271,
        gpsLng: 79.8612,
        districtId: district._id.toString(),
        submittedBy: citizen._id.toString()
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.report.hazardType).toBe('Flood');
    expect(res.body.data.isCorroborating).toBe(false);
  });

  it('should auto-detect duplicate and link as corroborating report within ~1km and 6 hours', async () => {
    // Create initial report
    const initialReport = await GroundReport.create({
      reportId: 'REP-ORIGINAL',
      hazardType: 'Flood',
      description: 'Original report',
      gpsLat: 6.9271,
      gpsLng: 79.8612,
      submittedTime: new Date(),
      districtId: district._id,
      verificationStatus: 'PENDING'
    });

    // Submit second report nearby (~0.002 deg diff ~= 200 meters)
    const res = await request(app)
      .post('/api/ground-reports')
      .send({
        hazardType: 'Flood',
        description: 'Duplicate nearby flood report',
        gpsLat: 6.9280,
        gpsLng: 79.8620,
        districtId: district._id.toString(),
        submittedBy: citizen._id.toString()
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.isCorroborating).toBe(true);

    // Verify existing report was updated with link
    const updatedInitial = await GroundReport.findById(initialReport._id);
    expect(updatedInitial.corroboratingReportIds.length).toBeGreaterThan(0);
  });

  it('should fail validation when hazardType is missing', async () => {
    const res = await request(app)
      .post('/api/ground-reports')
      .send({
        description: 'Missing hazard type',
        gpsLat: 6.9271,
        gpsLng: 79.8612,
        districtId: district._id.toString()
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should verify report successfully and log escalation if severity is HIGH', async () => {
    const report = await GroundReport.create({
      reportId: 'REP-TO-VERIFY',
      hazardType: 'Landslide',
      description: 'Landslide observed',
      gpsLat: 6.5,
      gpsLng: 79.9,
      districtId: district._id,
      verificationStatus: 'PENDING'
    });

    const consoleSpy = jest.spyOn(console, 'log');

    const res = await request(app)
      .patch(`/api/ground-reports/${report._id}/verify`)
      .send({ severityLevel: 'HIGH' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.verificationStatus).toBe('VERIFIED');
    expect(res.body.data.severityLevel).toBe('HIGH');
    expect(consoleSpy).toHaveBeenCalledWith('Flagged for escalation - extension point of UC1');

    consoleSpy.mockRestore();
  });

  it('should reject report with reason', async () => {
    const report = await GroundReport.create({
      reportId: 'REP-TO-REJECT',
      hazardType: 'Cyclone',
      description: 'False report',
      gpsLat: 6.5,
      gpsLng: 79.9,
      districtId: district._id,
      verificationStatus: 'PENDING'
    });

    const res = await request(app)
      .patch(`/api/ground-reports/${report._id}/reject`)
      .send({ rejectionReason: 'Unverified rumor / unconfirmed photo' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.verificationStatus).toBe('REJECTED');
    expect(res.body.data.rejectionReason).toBe('Unverified rumor / unconfirmed photo');
  });
});
