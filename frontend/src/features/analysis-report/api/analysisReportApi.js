const API_BASE = '/api/analysis-reports';

export const generateReport = async (data) => {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getReports = async () => {
  const res = await fetch(API_BASE);
  return res.json();
};

export const getReportById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`);
  return res.json();
};

export const shareReport = async (id, orgIds) => {
  const res = await fetch(`${API_BASE}/${id}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgIds })
  });
  return res.json();
};
