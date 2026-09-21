import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../shared/layouts/MainLayout';
import GroundReportPage from '../features/ground-report/pages/GroundReportPage';
import HazardWarningPage from '../features/hazard-warning/pages/HazardWarningPage';
import ResourceCoordinationPage from '../features/resource-coordination/pages/ResourceCoordinationPage';
import AnalysisReportPage from '../features/analysis-report/pages/AnalysisReportPage';

function HomePage() {
  return (
    <div>
      <h1>DEWECS System Dashboard</h1>
      <p>Welcome to the Disaster Early Warning and Emergency Coordination System.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Ground Reports</h3>
          <p>Submit and verify hazard reports from the field.</p>
        </div>
        <div style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Hazard Warnings</h3>
          <p>Issue location-specific disaster warnings.</p>
        </div>
        <div style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Resource Coordination</h3>
          <p>Allocate emergency rescue teams and assets.</p>
        </div>
        <div style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Post-Event Analysis</h3>
          <p>Generate analytical disaster evaluation reports.</p>
        </div>
      </div>
    </div>
  );
}

const AppRouter = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ground-reports" element={<GroundReportPage />} />
          <Route path="/hazard-warnings" element={<HazardWarningPage />} />
          <Route path="/resources" element={<ResourceCoordinationPage />} />
          <Route path="/analysis-reports" element={<AnalysisReportPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;
