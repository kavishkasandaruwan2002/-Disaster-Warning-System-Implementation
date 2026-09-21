import axiosClient from '../../../shared/utils/axiosClient';

/**
 * Ground Report Feature API Call Placeholders
 * 
 * TODO: Main Flow - Submit ground hazard report.
 * TODO: Alternate Flow - Fetch and verify ground hazard reports.
 */
export const getGroundReports = async () => {
  const response = await axiosClient.get('/ground-reports');
  return response.data;
};

export const submitGroundReport = async (reportData) => {
  const response = await axiosClient.post('/ground-reports', reportData);
  return response.data;
};

export const verifyGroundReport = async (id, status) => {
  const response = await axiosClient.patch(`/ground-reports/${id}/verify`, { status });
  return response.data;
};
