const express = require('express');
const cors = require('cors');

const notFound = require('./shared/middleware/notFound');
const errorHandler = require('./shared/middleware/errorHandler');

const groundReportRoutes = require('./modules/ground-report/ground-report.routes');
const hazardWarningRoutes = require('./modules/hazard-warning/hazard-warning.routes');
const resourceCoordinationRoutes = require('./modules/resource-coordination/resource-coordination.routes');
const analysisReportRoutes = require('./modules/analysis-report/analysis-report.routes');
const commonRoutes = require('./shared/routes/common.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'DEWECS Unified Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Shared Common Meta Routes
app.use('/api', commonRoutes);

// Feature Module Routes
app.use('/api/ground-reports', groundReportRoutes);
app.use('/api/hazard-alerts', hazardWarningRoutes);
app.use('/api/hazard-warnings', hazardWarningRoutes);
app.use('/api/analysis-reports', analysisReportRoutes);
app.use('/api', resourceCoordinationRoutes);

// Shared Error Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
