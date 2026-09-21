const request = require('supertest');
const app = require('../../../app');
const groundReportService = require('../ground-report.service');

jest.mock('../ground-report.service');

describe('Ground Report Module API', () => {
  it('GET /api/ground-reports should return report list', async () => {
    groundReportService.getAllReports.mockResolvedValue([]);
    const res = await request(app).get('/api/ground-reports');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
