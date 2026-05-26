import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Moon, Sun, LogOut, Globe } from "lucide-react";

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'payroll', label: 'Payroll', icon: '💰' },
  { id: 'income', label: 'Pendapatan', icon: '💵' },
  { id: 'employees', label: 'Karyawan', icon: '👥' },
  { id: 'financial', label: 'Keuangan', icon: '💼' },
  { id: 'settings', label: 'Pengaturan', icon: '⚙️' },
];

export default function AppLayout({ currentView, onNavigate, children }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar?')) {
      logout();
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar-panel">
        <div className="brand-block">
          <div className="brand-title">PT GDZ SaaS</div>
          <p className="brand-subtitle">Workforce & finance</p>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          {user && (
            <div style={{
              padding: '12px',
              marginBottom: '12px',
              backgroundColor: 'var(--surface-strong)',
              borderRadius: '8px',
              fontSize: '0.85rem',
            }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text)' }}>
                {user.name}
              </p>
              <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {user.role === 'admin' ? 'Administrator' : user.role === 'hr' ? 'HR Manager' : 'Employee'}
              </p>
            </div>
          )}

          <button
            className="sidebar-link"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="sidebar-icon">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </span>
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <button
            className="sidebar-link"
            onClick={toggleLanguage}
            title={`Switch to ${language === 'id' ? 'English' : 'Indonesian'}`}
          >
            <span className="sidebar-icon">
              <Globe size={20} />
            </span>
            <span>{language === 'id' ? 'English' : 'Indonesian'}</span>
          </button>

          <button
            className="sidebar-link"
            onClick={handleLogout}
            title="Logout"
            style={{
              color: 'var(--danger)',
            }}
          >
            <span className="sidebar-icon">
              <LogOut size={20} />
            </span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
