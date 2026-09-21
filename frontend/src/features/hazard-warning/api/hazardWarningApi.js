import axiosClient from '../../../shared/utils/axiosClient';

/**
 * Hazard Warning Feature API Call Placeholders
 * 
 * TODO: Main Flow - Issue location-specific hazard warning.
 * TODO: Alternate Flow - Revoke active warning.
 */
export const getActiveWarnings = async () => {
  const response = await axiosClient.get('/hazard-warnings');
  return response.data;
};

export const issueHazardWarning = async (warningData) => {
  const response = await axiosClient.post('/hazard-warnings', warningData);
  return response.data;
};

export const revokeHazardWarning = async (id) => {
  const response = await axiosClient.patch(`/hazard-warnings/${id}/revoke`);
  return response.data;
};
