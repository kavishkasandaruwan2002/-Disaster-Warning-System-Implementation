const request = require('supertest');
const app = require('../../../app');
const resourceService = require('../resource-coordination.service');

jest.mock('../resource-coordination.service');

describe('Resource Coordination Module API', () => {
  it('GET /api/resource-coordinations should return emergency resource list', async () => {
    resourceService.getAllResources.mockResolvedValue([]);
    const res = await request(app).get('/api/resource-coordinations');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
