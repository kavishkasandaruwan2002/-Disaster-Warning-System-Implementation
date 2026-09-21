import axiosClient from '../../../shared/utils/axiosClient';

/**
 * Resource Coordination Feature API Call Placeholders
 * 
 * TODO: Main Flow - Dispatch resources to incident site.
 * TODO: Alternate Flow - Register new emergency resource inventory.
 */
export const getResources = async () => {
  const response = await axiosClient.get('/resource-coordinations');
  return response.data;
};

export const addResource = async (resourceData) => {
  const response = await axiosClient.post('/resource-coordinations', resourceData);
  return response.data;
};

export const dispatchResource = async (id, locationData) => {
  const response = await axiosClient.patch(`/resource-coordinations/${id}/dispatch`, { assignedLocation: locationData });
  return response.data;
};
