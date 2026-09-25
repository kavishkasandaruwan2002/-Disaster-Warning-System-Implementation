import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../shared/layouts/MainLayout';

import HomePage from '../features/home/HomePage';
import SubmitReportPage from '../features/ground-report/pages/SubmitReportPage';
import VerificationQueuePage from '../features/ground-report/pages/VerificationQueuePage';
import IssueWarningPage from '../features/hazard-warning/pages/IssueWarningPage';
import ActiveWarningsPage from '../features/hazard-warning/pages/ActiveWarningsPage';
import ResourceDashboardPage from '../features/resource-coordination/pages/ResourceDashboardPage';
import GenerateReportPage from '../features/analysis-report/pages/GenerateReportPage';
import ReportSummaryPage from '../features/analysis-report/pages/ReportSummaryPage';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ground-reports/submit" element={<SubmitReportPage />} />
          <Route path="/ground-reports/queue" element={<VerificationQueuePage />} />
          <Route path="/ground-reports" element={<VerificationQueuePage />} />

          <Route path="/hazard-warnings/issue" element={<IssueWarningPage />} />
          <Route path="/hazard-warnings/active" element={<ActiveWarningsPage />} />
          <Route path="/hazard-warnings" element={<ActiveWarningsPage />} />

          <Route path="/resources" element={<ResourceDashboardPage />} />

          <Route path="/analysis-reports" element={<ReportSummaryPage />} />
          <Route path="/analysis-reports/generate" element={<GenerateReportPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const AppRouter = () => {
  return (
    <Router>
      <MainLayout>
        <AnimatedRoutes />
      </MainLayout>
    </Router>
  );
};

export default AppRouter;
