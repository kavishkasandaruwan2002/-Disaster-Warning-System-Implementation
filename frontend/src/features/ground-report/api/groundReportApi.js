const API_BASE = '/api/ground-reports';

export const submitReport = async (data) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getReports = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}${query ? `?${query}` : ''}`);
  return res.json();
};

export const getReportById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`);
  return res.json();
};

export const verifyReport = async (id, severityLevel) => {
  const res = await fetch(`${API_BASE}/${id}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ severityLevel })
  });
  return res.json();
};

export const rejectReport = async (id, rejectionReason) => {
  const res = await fetch(`${API_BASE}/${id}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rejectionReason })
  });
  return res.json();
};

export const requestInfo = async (id) => {
  const res = await fetch(`${API_BASE}/${id}/request-info`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
};

export const addEvidence = async (id, data) => {
  const res = await fetch(`${API_BASE}/${id}/add-evidence`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};
