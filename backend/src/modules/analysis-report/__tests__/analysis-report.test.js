const request = require('supertest');
const app = require('../../../app');
const analysisService = require('../analysis-report.service');

jest.mock('../analysis-report.service');

describe('Analysis Report Module API', () => {
  it('GET /api/analysis-reports should return post-event analysis reports', async () => {
    analysisService.getAllReports.mockResolvedValue([]);
    const res = await request(app).get('/api/analysis-reports');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
