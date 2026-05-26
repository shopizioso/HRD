import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppModal from '../components/AppModal';
import AppTable from '../components/AppTable';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('company');
  const [showUserModal, setShowUserModal] = useState(false);

  // Company settings
  const [companySettings, setCompanySettings] = useState({
    name: 'PT Global Digital Zone',
    email: 'ptglobaldigitalzone@gmail.com',
    phone: '+62 274 123 4567',
    address: 'Yogyakarta, Indonesia',
    logoUrl: '',
    taxYear: 2026,
  });

  // Payroll settings
  const [payrollSettings, setPayrollSettings] = useState({
    pphTaxRate: 15,
    bpjsPercentage: 4.24,
    bpjsDailyMax: 100000,
    bpjsDailyMin: 50000,
    allowancePercentage: 20,
    overtimeRate: 1.5,
    paymentMethod: 'transfer',
  });

  // Users management
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin PT GDZ', email: 'admin@gdz.com', role: 'admin', status: 'active' },
    { id: 2, name: 'HR Manager', email: 'hr@gdz.com', role: 'hr', status: 'active' },
    { id: 3, name: 'Employee User', email: 'emp@gdz.com', role: 'employee', status: 'active' },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'employee',
  });

  const handleCompanyChange = (field, value) => {
    setCompanySettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePayrollChange = (field, value) => {
    setPayrollSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveCompanySettings = () => {
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
    addToast('Company settings saved successfully', 'success');
  };

  const savePayrollSettings = () => {
    localStorage.setItem('payrollSettings', JSON.stringify(payrollSettings));
    addToast('Payroll settings saved successfully', 'success');
  };

  const addUser = () => {
    if (!newUser.name || !newUser.email) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    const user = {
      id: users.length + 1,
      ...newUser,
      status: 'active',
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'employee' });
    setShowUserModal(false);
    addToast('User added successfully', 'success');
  };

  const deleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
    addToast('User deleted successfully', 'success');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ {t('settings') || 'Settings'}</h1>
        <p>Manage system configuration and preferences</p>
      </div>

      {/* Admin only warning */}
      {user?.role !== 'admin' && (
        <div className="warning-banner">
          ⚠️ {t('adminAccessRequired') || 'You have limited access to settings as non-admin user.'}
        </div>
      )}

      <div className="settings-container">
        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab('company')}
          >
            🏢 Company
          </button>
          <button
            className={`tab ${activeTab === 'payroll' ? 'active' : ''}`}
            onClick={() => setActiveTab('payroll')}
          >
            💰 Payroll
          </button>
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            disabled={user?.role !== 'admin'}
          >
            👥 Users
          </button>
          <button
            className={`tab ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
            disabled={user?.role !== 'admin'}
          >
            💾 Backup
          </button>
          <button
            className={`tab ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            ℹ️ System
          </button>
        </div>

        {/* Tab Contents */}
        <div className="settings-content">
          {/* Company Settings */}
          {activeTab === 'company' && (
            <div className="settings-section">
              <h2>Company Information</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label>Company Name</label>
                  <AppInput
                    value={companySettings.name}
                    onChange={(e) => handleCompanyChange('name', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <AppInput
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => handleCompanyChange('email', e.target.value)}
                    placeholder="company@email.com"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <AppInput
                    value={companySettings.phone}
                    onChange={(e) => handleCompanyChange('phone', e.target.value)}
                    placeholder="+62 XXX XXXX XXXX"
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <AppInput
                    value={companySettings.address}
                    onChange={(e) => handleCompanyChange('address', e.target.value)}
                    placeholder="Enter company address"
                  />
                </div>

                <div className="form-group">
                  <label>Tax Year</label>
                  <AppInput
                    type="number"
                    value={companySettings.taxYear}
                    onChange={(e) => handleCompanyChange('taxYear', parseInt(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Company Logo URL</label>
                  <AppInput
                    value={companySettings.logoUrl}
                    onChange={(e) => handleCompanyChange('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <AppButton onClick={saveCompanySettings} variant="primary">
                  💾 Save Company Settings
                </AppButton>
              </div>
            </div>
          )}

          {/* Payroll Settings */}
          {activeTab === 'payroll' && (
            <div className="settings-section">
              <h2>Payroll Configuration</h2>
              <div className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>PPh 21 Tax Rate (%)</label>
                    <AppInput
                      type="number"
                      value={payrollSettings.pphTaxRate}
                      onChange={(e) => handlePayrollChange('pphTaxRate', parseFloat(e.target.value))}
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>BPJS Percentage (%)</label>
                    <AppInput
                      type="number"
                      value={payrollSettings.bpjsPercentage}
                      onChange={(e) => handlePayrollChange('bpjsPercentage', parseFloat(e.target.value))}
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>BPJS Daily Maximum (Rp)</label>
                    <AppInput
                      type="number"
                      value={payrollSettings.bpjsDailyMax}
                      onChange={(e) => handlePayrollChange('bpjsDailyMax', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>BPJS Daily Minimum (Rp)</label>
                    <AppInput
                      type="number"
                      value={payrollSettings.bpjsDailyMin}
                      onChange={(e) => handlePayrollChange('bpjsDailyMin', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Allowance Percentage (%)</label>
                    <AppInput
                      type="number"
                      value={payrollSettings.allowancePercentage}
                      onChange={(e) => handlePayrollChange('allowancePercentage', parseFloat(e.target.value))}
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Overtime Rate (x)</label>
                    <AppInput
                      type="number"
                      value={payrollSettings.overtimeRate}
                      onChange={(e) => handlePayrollChange('overtimeRate', parseFloat(e.target.value))}
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={payrollSettings.paymentMethod}
                    onChange={(e) => handlePayrollChange('paymentMethod', e.target.value)}
                    className="app-input-field"
                  >
                    <option value="transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="debit-card">Debit Card</option>
                  </select>
                </div>

                <AppButton onClick={savePayrollSettings} variant="primary">
                  💾 Save Payroll Settings
                </AppButton>
              </div>
            </div>
          )}

          {/* Users Management */}
          {activeTab === 'users' && (
            <div className="settings-section">
              <h2>User Management</h2>
              <AppButton 
                onClick={() => setShowUserModal(true)} 
                variant="primary"
                style={{ marginBottom: '20px' }}
              >
                ➕ Add New User
              </AppButton>

              <div className="users-table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <span className={`status-badge status-${user.status}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <AppButton
                            onClick={() => deleteUser(user.id)}
                            variant="danger"
                            style={{ padding: '6px 12px', fontSize: '0.85em' }}
                          >
                            🗑️ Delete
                          </AppButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <AppModal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                title="Add New User"
              >
                <div className="modal-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <AppInput
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <AppInput
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="user@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="app-input-field"
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <AppButton onClick={addUser} variant="primary">
                      Add User
                    </AppButton>
                    <AppButton onClick={() => setShowUserModal(false)} variant="secondary">
                      Cancel
                    </AppButton>
                  </div>
                </div>
              </AppModal>
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <div className="settings-section">
              <h2>Data Backup & Restore</h2>
              <div className="backup-actions">
                <div className="backup-card">
                  <h3>📦 Create Backup</h3>
                  <p>Create a complete backup of all payroll data</p>
                  <AppButton variant="primary">
                    Create Backup Now
                  </AppButton>
                </div>

                <div className="backup-card">
                  <h3>📥 Restore Backup</h3>
                  <p>Restore data from a previous backup file</p>
                  <AppButton variant="secondary">
                    Choose File & Restore
                  </AppButton>
                </div>

                <div className="backup-card">
                  <h3>⏰ Auto-Backup Schedule</h3>
                  <label>
                    <input type="checkbox" defaultChecked /> Enable auto-backup daily
                  </label>
                  <label>
                    <input type="checkbox" /> Enable auto-backup weekly
                  </label>
                </div>

                <div className="backup-info">
                  <h4>Recent Backups:</h4>
                  <ul>
                    <li>backup_2026_05_25_120000.json - 2.5 MB - 12:00 PM</li>
                    <li>backup_2026_05_24_120000.json - 2.4 MB - 12:00 PM</li>
                    <li>backup_2026_05_23_120000.json - 2.3 MB - 12:00 PM</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* System Information */}
          {activeTab === 'system' && (
            <div className="settings-section">
              <h2>System Information</h2>
              <div className="system-info">
                <div className="info-card">
                  <label>Application Version</label>
                  <value>1.0.0</value>
                </div>

                <div className="info-card">
                  <label>Database Status</label>
                  <value className="status-online">✓ Connected</value>
                </div>

                <div className="info-card">
                  <label>Backend Server</label>
                  <value className="status-online">✓ Running (http://localhost:5000)</value>
                </div>

                <div className="info-card">
                  <label>Total Users</label>
                  <value>{users.length}</value>
                </div>

                <div className="info-card">
                  <label>Last Database Backup</label>
                  <value>2 hours ago</value>
                </div>

                <div className="info-card">
                  <label>System Uptime</label>
                  <value>15 days, 8 hours</value>
                </div>

                <div className="info-card">
                  <label>API Endpoint</label>
                  <value>http://localhost:5000/api</value>
                </div>

                <div className="info-card">
                  <label>Frontend Version</label>
                  <value>v1.0.0 (React + Vite)</value>
                </div>
              </div>

              <div className="system-actions">
                <AppButton variant="secondary">
                  🔄 Clear Cache
                </AppButton>
                <AppButton variant="danger">
                  🔴 Reset All Settings
                </AppButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
