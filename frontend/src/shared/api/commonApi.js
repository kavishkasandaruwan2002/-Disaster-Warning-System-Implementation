const API_BASE = '/api';

export const getDistricts = async () => {
  const res = await fetch(`${API_BASE}/districts`);
  return res.json();
};

export const getRiverBasins = async () => {
  const res = await fetch(`${API_BASE}/river-basins`);
  return res.json();
};

export const getCitizens = async () => {
  const res = await fetch(`${API_BASE}/citizens`);
  return res.json();
};

export const getOrganisations = async () => {
  const res = await fetch(`${API_BASE}/organisations`);
  return res.json();
};
