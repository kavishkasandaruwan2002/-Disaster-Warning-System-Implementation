const request = require('supertest');
const app = require('../../../app');
const hazardWarningService = require('../hazard-warning.service');

jest.mock('../hazard-warning.service');

describe('Hazard Warning Module API', () => {
  it('GET /api/hazard-warnings should return active warnings list', async () => {
    hazardWarningService.getActiveWarnings.mockResolvedValue([]);
    const res = await request(app).get('/api/hazard-warnings');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
