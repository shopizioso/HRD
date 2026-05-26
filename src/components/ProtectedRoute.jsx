import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';

export function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        fontSize: '1.5rem',
      }}>
        <div style={{ textAlign: 'center', animation: 'pulse 1s ease-in-out infinite' }}>
          Loading... ⏳
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return children;
}

export function RequirePermission({ permission, children, fallback }) {
  const { user } = useAuth();

  if (!user) {
    return fallback || null;
  }

  // Admin has all permissions
  if (user.role === 'admin') {
    return children;
  }

  // Check specific permission based on role
  const rolePermissions = {
    hr: [
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
    employee: [
      'view_own_slip',
      'download_slip',
    ],
  };

  const hasPermission = rolePermissions[user.role]?.includes(permission);

  if (!hasPermission) {
    return fallback || <AccessDenied />;
  }

  return children;
}

function AccessDenied() {
  return (
    <div style={{
      display: 'grid',
      placeItems: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '24px',
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', margin: '0 0 16px' }}>🚫</h1>
        <h2 style={{ margin: '0 0 12px' }}>Akses Ditolak</h2>
        <p style={{ margin: '0', color: 'var(--text-muted)' }}>
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
      </div>
    </div>
  );
}
