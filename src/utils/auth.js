// Mock authentication - gunakan untuk demo
// Untuk production: integrate dengan backend API

export const MOCK_USERS = {
  admin: {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123', // Demo only - NEVER do this in production
    email: 'admin@ptgdz.com',
    name: 'Admin PT GDZ',
    role: 'admin',
    avatar: '👨‍💼',
  },
  hr: {
    id: 'hr-1',
    username: 'hr',
    password: 'hr123',
    email: 'hr@ptgdz.com',
    name: 'HR Manager',
    role: 'hr',
    avatar: '👩‍💼',
  },
  employee: {
    id: 'emp-1',
    username: 'employee',
    password: 'emp123',
    email: 'viona@ptgdz.com',
    name: 'Viona Nur Alifah',
    role: 'employee',
    avatar: '👩‍🦰',
  },
};

export const ROLES = {
  admin: {
    label: 'Administrator',
    permissions: ['*'], // All permissions
    color: '#ef4444',
  },
  hr: {
    label: 'HR Manager',
    permissions: [
      'view_payroll',
      'create_slip',
      'edit_slip',
      'delete_slip',
      'send_slip',
      'view_employees',
      'manage_employees',
      'view_reports',
      'export_data',
      'view_audit',
    ],
    color: '#f59e0b',
  },
  employee: {
    label: 'Employee',
    permissions: [
      'view_own_slip',
      'download_slip',
    ],
    color: '#3b82f6',
  },
};

export function authenticateUser(username, password) {
  const user = Object.values(MOCK_USERS).find(
    u => u.username === username && u.password === password
  );

  if (user) {
    const token = btoa(JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      timestamp: Date.now(),
    }));
    return { success: true, user: { ...user, password: undefined }, token };
  }

  return { success: false, error: 'Username atau password salah' };
}

export function validateToken(token) {
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token));
    // Check if token is still valid (less than 24 hours old)
    if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }
    return decoded;
  } catch (e) {
    return null;
  }
}

export function hasPermission(userRole, permission) {
  const role = ROLES[userRole];
  if (!role) return false;
  if (role.permissions.includes('*')) return true;
  return role.permissions.includes(permission);
}

export function canViewEmployee(currentUser, targetEmployeeId) {
  if (currentUser.role === 'admin' || currentUser.role === 'hr') return true;
  if (currentUser.role === 'employee') return currentUser.id === targetEmployeeId;
  return false;
}
