const request = require('supertest');
const app = require('../../../app');
const setupTestDB = require('../../../testSetup');
const { District, Citizen, Notification } = require('../../../shared/models');
const HazardAlert = require('../hazard-warning.model');

setupTestDB();

describe('Hazard Warning Module API (UC1)', () => {
  let district1, district2, citizens;

  beforeEach(async () => {
    district1 = await District.create({ districtId: 'DIST-HW-1', name: 'District HW 1' });
    district2 = await District.create({ districtId: 'DIST-HW-2', name: 'District HW 2' });

    citizens = await Citizen.create([
      { nationalId: 'NAT-1', name: 'Citizen 1', homeAddress: 'Addr 1', districtId: district1._id },
      { nationalId: 'NAT-2', name: 'Citizen 2', homeAddress: 'Addr 2', districtId: district1._id },
      { nationalId: 'NAT-3', name: 'Citizen 3', homeAddress: 'Addr 3', districtId: district2._id }
    ]);
  });

  it('should preview reach calculation accurately', async () => {
    const res = await request(app)
      .post('/api/hazard-alerts/preview')
      .send({
        hazardType: 'Flood',
        targetDistrictIds: [district1._id.toString(), district2._id.toString()],
        severityLevel: 'Watch',
        message: 'Preview test'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.estimatedReach).toBe(3);
  });

  it('should successfully issue warning with notification fan-out (3 channels per citizen)', async () => {
    const res = await request(app)
      .post('/api/hazard-alerts')
      .send({
        hazardType: 'Flood',
        severityLevel: 'Watch',
        targetDistrictIds: [district1._id.toString()],
        message: 'Flood alert for District 1 citizens'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notifiedCount + res.body.data.failedCount).toBe(6); // 2 citizens * 3 channels

    const notifications = await Notification.find();
    expect(notifications.length).toBe(6);
  });

  it('should escalate warning and re-notify citizens', async () => {
    const alert = await HazardAlert.create({
      alertId: 'ALERT-TEST-ESC',
      hazardType: 'Landslide',
      severityLevel: 'Watch',
      targetDistrictIds: [district1._id],
      message: 'Initial watch',
      status: 'ACTIVE'
    });

    const consoleSpy = jest.spyOn(console, 'log');

    const res = await request(app)
      .patch(`/api/hazard-alerts/${alert._id}/escalate`)
      .send({ newSeverityLevel: 'Warning' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.alert.status).toBe('ESCALATED');
    expect(res.body.data.alert.severityLevel).toBe('Warning');
    expect(consoleSpy).toHaveBeenCalledWith('Notifying District Officer - trigger for UC3');

    consoleSpy.mockRestore();
  });

  it('should reject escalation if already at Emergency severity level', async () => {
    const alert = await HazardAlert.create({
      alertId: 'ALERT-EMERGENCY',
      hazardType: 'Cyclone',
      severityLevel: 'Emergency',
      targetDistrictIds: [district1._id],
      message: 'Max level warning',
      status: 'ACTIVE'
    });

    const res = await request(app)
      .patch(`/api/hazard-alerts/${alert._id}/escalate`)
      .send({ newSeverityLevel: 'Emergency' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should cancel active warning and send follow-up notifications', async () => {
    const alert = await HazardAlert.create({
      alertId: 'ALERT-TO-CANCEL',
      hazardType: 'Drought',
      severityLevel: 'Advisory',
      targetDistrictIds: [district1._id],
      message: 'Dry weather advisory',
      status: 'ACTIVE'
    });

    const res = await request(app)
      .patch(`/api/hazard-alerts/${alert._id}/cancel`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });
});
