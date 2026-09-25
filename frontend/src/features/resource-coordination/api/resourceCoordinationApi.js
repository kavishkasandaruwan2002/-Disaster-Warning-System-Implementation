const API_BASE = '/api';

export const getResourceDashboard = async (districtId) => {
  const res = await fetch(`${API_BASE}/resource-dashboard/${districtId}`);
  return res.json();
};

export const registerShelter = async (data) => {
  const res = await fetch(`${API_BASE}/shelters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateShelterOccupancy = async (id, newOccupancy) => {
  const res = await fetch(`${API_BASE}/shelters/${id}/occupancy`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newOccupancy })
  });
  return res.json();
};

export const getRescueTeams = async (district = '', status = '') => {
  const params = new URLSearchParams();
  if (district) params.append('district', district);
  if (status) params.append('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/rescue-teams${query}`);
  return res.json();
};

export const dispatchRescueTeam = async (id, location) => {
  const res = await fetch(`${API_BASE}/rescue-teams/${id}/dispatch`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location })
  });
  return res.json();
};

export const returnRescueTeam = async (id) => {
  const res = await fetch(`${API_BASE}/rescue-teams/${id}/return`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
};

export const distributeReliefSupply = async (data) => {
  const res = await fetch(`${API_BASE}/relief-supplies/distribute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};
