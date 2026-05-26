const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let authToken = localStorage.getItem('auth_token');

export function setAuthToken(token) {
  authToken = token;
  localStorage.setItem('auth_token', token);
}

export function getAuthToken() {
  return authToken || localStorage.getItem('auth_token');
}

export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem('auth_token');
}

// Helper to make API calls with auth
async function apiCall(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (getAuthToken()) {
    headers['Authorization'] = `Bearer ${getAuthToken()}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/login';
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API Error');
  }

  return data;
}

// Auth API
export const authAPI = {
  login: (username, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  register: (userData) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  verify: () => apiCall('/auth/verify'),

  logout: () => apiCall('/auth/logout', { method: 'POST' }),

  getMe: () => apiCall('/auth/me')
};

// Payroll API
export const payrollAPI = {
  getAll: (month, year, employeeId) =>
    apiCall(`/payroll?month=${month}&year=${year}${employeeId ? `&employee_id=${employeeId}` : ''}`),

  create: (data) =>
    apiCall('/payroll', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id, data) =>
    apiCall(`/payroll/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  approve: (id) =>
    apiCall(`/payroll/${id}/approve`, { method: 'PUT' }),

  delete: (id) =>
    apiCall(`/payroll/${id}`, { method: 'DELETE' })
};

// Employees API
export const employeesAPI = {
  getAll: () => apiCall('/employees'),

  getById: (id) => apiCall(`/employees/${id}`),

  create: (data) =>
    apiCall('/employees', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id, data) =>
    apiCall(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (id) =>
    apiCall(`/employees/${id}`, { method: 'DELETE' })
};

// Reports API
export const reportsAPI = {
  getPayrollReport: (month, year) =>
    apiCall(`/reports/payroll?month=${month}&year=${year}`),

  getDepartmentReport: () => apiCall('/reports/department'),

  exportCSV: (data) =>
    apiCall('/reports/export/csv', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

// PDF API
export const pdfAPI = {
  getTemplates: () => apiCall('/pdf/templates'),

  createTemplate: (data) =>
    apiCall('/pdf/templates', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  generatePDF: (data) =>
    apiCall('/pdf/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  downloadPDF: (id) => apiCall(`/pdf/download/${id}`)
};

// Backup API
export const backupAPI = {
  create: () => apiCall('/backup/create', { method: 'POST' }),

  list: () => apiCall('/backup/list'),

  restore: (id) =>
    apiCall(`/backup/restore/${id}`, { method: 'POST' }),

  delete: (id) =>
    apiCall(`/backup/${id}`, { method: 'DELETE' })
};

// Audit API
export const auditAPI = {
  getLogs: (action, entityType, userId, limit, offset) =>
    apiCall(`/audit?action=${action || ''}&entity_type=${entityType || ''}&user_id=${userId || ''}&limit=${limit || 100}&offset=${offset || 0}`),

  export: (format) =>
    apiCall('/audit/export', {
      method: 'POST',
      body: JSON.stringify({ format })
    }),

  getStats: () => apiCall('/audit/stats')
};

export default {
  authAPI,
  payrollAPI,
  employeesAPI,
  reportsAPI,
  pdfAPI,
  backupAPI,
  auditAPI
};
