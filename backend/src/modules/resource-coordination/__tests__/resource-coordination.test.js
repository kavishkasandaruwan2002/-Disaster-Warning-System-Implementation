const request = require('supertest');
const app = require('../../../app');
const setupTestDB = require('../../../testSetup');
const { District, Organisation } = require('../../../shared/models');
const { Shelter, RescueTeam, ReliefSupply } = require('../resource-coordination.model');

setupTestDB();

describe('Resource Coordination Module API (UC3)', () => {
  let district, org;

  beforeEach(async () => {
    district = await District.create({ districtId: 'DIST-RC-1', name: 'RC District' });
    org = await Organisation.create({ orgId: 'ORG-RC-1', name: 'Test Org', type: 'NGO' });
  });

  it('should aggregate resource dashboard for a district', async () => {
    await Shelter.create({
      shelterId: 'S-1',
      name: 'Shelter 1',
      location: 'Loc 1',
      capacity: 100,
      districtId: district._id,
      ownerOrgId: org._id
    });

    await RescueTeam.create({
      teamId: 'T-1',
      name: 'Team 1',
      districtId: district._id,
      ownerOrgId: org._id
    });

    await ReliefSupply.create({
      supplyId: 'SUP-1',
      supplyType: 'Food',
      quantity: 500,
      districtId: district._id,
      ownerOrgId: org._id
    });

    const res = await request(app).get(`/api/resource-dashboard/${district._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.shelters.length).toBe(1);
    expect(res.body.data.rescueTeams.length).toBe(1);
    expect(res.body.data.reliefSupplies.length).toBe(1);
  });

  it('should reject shelter occupancy update when exceeding capacity', async () => {
    const shelter = await Shelter.create({
      shelterId: 'S-CAP',
      name: 'Cap Shelter',
      location: 'Loc',
      capacity: 50,
      currentOccupancy: 10,
      districtId: district._id,
      ownerOrgId: org._id,
      status: 'OPEN'
    });

    const res = await request(app)
      .patch(`/api/shelters/${shelter._id}/occupancy`)
      .send({ newOccupancy: 60 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Shelter at capacity');
  });

  it('should dispatch available rescue team successfully', async () => {
    const team = await RescueTeam.create({
      teamId: 'T-DISPATCH',
      name: 'Team Dispatch',
      status: 'AVAILABLE',
      districtId: district._id,
      ownerOrgId: org._id
    });

    const res = await request(app)
      .patch(`/api/rescue-teams/${team._id}/dispatch`)
      .send({ location: 'Sector 7 Flooded Zone' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('DISPATCHED');
    expect(res.body.data.currentLocation).toBe('Sector 7 Flooded Zone');
  });

  it('should reject dispatch when rescue team is not AVAILABLE', async () => {
    const team = await RescueTeam.create({
      teamId: 'T-BUSY',
      name: 'Team Busy',
      status: 'DISPATCHED',
      districtId: district._id,
      ownerOrgId: org._id
    });

    const res = await request(app)
      .patch(`/api/rescue-teams/${team._id}/dispatch`)
      .send({ location: 'Another Location' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Team not available');
  });

  it('should distribute relief supply successfully', async () => {
    const supply = await ReliefSupply.create({
      supplyId: 'SUP-DIST',
      supplyType: 'Water',
      quantity: 100,
      distributedQuantity: 20,
      districtId: district._id,
      ownerOrgId: org._id
    });

    const res = await request(app)
      .post('/api/relief-supplies/distribute')
      .send({
        supplyId: supply._id.toString(),
        quantity: 30
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.supply.distributedQuantity).toBe(50);
  });

  it('should reject distribution when quantity exceeds on-hand stock', async () => {
    const supply = await ReliefSupply.create({
      supplyId: 'SUP-OVER',
      supplyType: 'Medicine',
      quantity: 50,
      distributedQuantity: 40,
      districtId: district._id,
      ownerOrgId: org._id
    });

    const res = await request(app)
      .post('/api/relief-supplies/distribute')
      .send({
        supplyId: supply._id.toString(),
        quantity: 20
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Quantity exceeds on-hand stock');
  });
});
