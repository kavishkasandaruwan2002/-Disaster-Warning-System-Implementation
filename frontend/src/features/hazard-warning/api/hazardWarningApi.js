const API_BASE = '/api/hazard-alerts';

export const previewReach = async (data) => {
  const res = await fetch(`${API_BASE}/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const issueWarning = async (data) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getActiveWarnings = async (status = '') => {
  const query = status ? `?status=${status}` : '';
  const res = await fetch(`${API_BASE}${query}`);
  return res.json();
};

export const escalateWarning = async (id, newSeverityLevel) => {
  const res = await fetch(`${API_BASE}/${id}/escalate`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newSeverityLevel })
  });
  return res.json();
};

export const cancelWarning = async (id) => {
  const res = await fetch(`${API_BASE}/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
};

export const getNotificationStats = async (id) => {
  const res = await fetch(`${API_BASE}/${id}/notifications`);
  return res.json();
};
