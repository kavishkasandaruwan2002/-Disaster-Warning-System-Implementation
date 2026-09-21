import axiosClient from '../../../shared/utils/axiosClient';

/**
 * Analysis Report Feature API Call Placeholders
 * 
 * TODO: Main Flow - Generate post-event analysis report.
 * TODO: Alternate Flow - Fetch generated report summaries and analytics.
 */
export const getAnalysisReports = async () => {
  const response = await axiosClient.get('/analysis-reports');
  return response.data;
};

export const getAnalysisReportById = async (id) => {
  const response = await axiosClient.get(`/analysis-reports/${id}`);
  return response.data;
};

export const generateAnalysisReport = async (reportData) => {
  const response = await axiosClient.post('/analysis-reports', reportData);
  return response.data;
};
