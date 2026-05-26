import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = login(username, password);
      if (result.success) {
        addToast(`Selamat datang, ${result.user.name}!`, 'success');
      } else {
        addToast(result.error, 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan saat login', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">🏢</div>
            <h1>PT GDZ SaaS</h1>
            <p>Workforce & Finance Management</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                disabled={isLoading}
                autoFocus
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                disabled={isLoading}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="login-button"
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Sedang login...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="login-demo">
            <p className="demo-title">Demo Credentials:</p>
            <div className="demo-users">
              <div className="demo-user">
                <strong>Admin:</strong>
                <code>admin / admin123</code>
              </div>
              <div className="demo-user">
                <strong>HR Manager:</strong>
                <code>hr / hr123</code>
              </div>
              <div className="demo-user">
                <strong>Employee:</strong>
                <code>employee / emp123</code>
              </div>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>© 2026 PT Global Digital Zone. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
