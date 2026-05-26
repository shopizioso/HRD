import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import '../styles/AuditPage.css';

const AuditPage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();

  // Mock audit logs data
  const [auditLogs] = useState([
    {
      id: 1,
      timestamp: '2026-05-25T14:35:22Z',
      user: 'Admin PT GDZ',
      action: 'CREATE',
      entityType: 'PAYROLL',
      entityId: 'PAY-2026-05-001',
      description: 'Created payroll for May 2026',
      changes: { status: 'draft' },
      ipAddress: '192.168.1.100',
    },
    {
      id: 2,
      timestamp: '2026-05-25T13:20:15Z',
      user: 'Admin PT GDZ',
      action: 'UPDATE',
      entityType: 'EMPLOYEE',
      entityId: 'EMP-001',
      description: 'Updated employee salary',
      changes: { oldSalary: 2500000, newSalary: 2750000 },
      ipAddress: '192.168.1.100',
    },
    {
      id: 3,
      timestamp: '2026-05-25T12:45:00Z',
      user: 'Admin PT GDZ',
      action: 'APPROVE',
      entityType: 'PAYROLL',
      entityId: 'PAY-2026-04-001',
      description: 'Approved April 2026 payroll',
      changes: { status: 'approved' },
      ipAddress: '192.168.1.100',
    },
    {
      id: 4,
      timestamp: '2026-05-25T10:15:30Z',
      user: 'HR Manager',
      action: 'CREATE',
      entityType: 'EMPLOYEE',
      entityId: 'EMP-042',
      description: 'Created new employee record',
      changes: { name: 'John Doe', position: 'Staff' },
      ipAddress: '192.168.1.101',
    },
    {
      id: 5,
      timestamp: '2026-05-24T16:50:45Z',
      user: 'Admin PT GDZ',
      action: 'DELETE',
      entityType: 'USER',
      entityId: 'USR-015',
      description: 'Deleted inactive user account',
      changes: { username: 'old_user' },
      ipAddress: '192.168.1.100',
    },
    {
      id: 6,
      timestamp: '2026-05-24T15:22:10Z',
      user: 'Admin PT GDZ',
      action: 'EXPORT',
      entityType: 'REPORT',
      entityId: 'RPT-2026-04',
      description: 'Exported April payroll report as CSV',
      changes: { format: 'CSV', recipients: 1 },
      ipAddress: '192.168.1.100',
    },
    {
      id: 7,
      timestamp: '2026-05-24T14:10:05Z',
      user: 'Admin PT GDZ',
      action: 'UPDATE',
      entityType: 'SETTINGS',
      entityId: 'SETTINGS-001',
      description: 'Updated company settings',
      changes: { field: 'company_name', oldValue: 'PT GDZ', newValue: 'PT Global Digital Zone' },
      ipAddress: '192.168.1.100',
    },
    {
      id: 8,
      timestamp: '2026-05-24T11:30:20Z',
      user: 'Admin PT GDZ',
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: 'AUTH-001',
      description: 'User logged in',
      changes: { method: 'password' },
      ipAddress: '192.168.1.100',
    },
  ]);

  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filter logs based on criteria
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const actionMatch = filterAction === 'all' || log.action === filterAction;
      const entityMatch = filterEntity === 'all' || log.entityType === filterEntity;
      const userMatch = filterUser === 'all' || log.user === filterUser;
      const searchMatch = !searchQuery || 
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
      
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const logDate = new Date(log.timestamp).getTime();
        if (dateFrom) {
          const fromDate = new Date(dateFrom).getTime();
          dateMatch = dateMatch && logDate >= fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo).getTime();
          dateMatch = dateMatch && logDate <= toDate;
        }
      }

      return actionMatch && entityMatch && userMatch && searchMatch && dateMatch;
    });
  }, [auditLogs, filterAction, filterEntity, filterUser, searchQuery, dateFrom, dateTo]);

  const getActionColor = (action) => {
    const colors = {
      CREATE: '#10b981',
      UPDATE: '#f59e0b',
      DELETE: '#ef4444',
      APPROVE: '#3b82f6',
      EXPORT: '#8b5cf6',
      LOGIN: '#06b6d4',
      LOGOUT: '#6b7280',
    };
    return colors[action] || '#6b7280';
  };

  const getEntityIcon = (entity) => {
    const icons = {
      PAYROLL: '💰',
      EMPLOYEE: '👤',
      USER: '👨‍💼',
      SETTINGS: '⚙️',
      REPORT: '📊',
      AUTH: '🔐',
      BACKUP: '💾',
    };
    return icons[entity] || '📋';
  };

  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const exportLogs = (format) => {
    try {
      let content = '';
      
      if (format === 'csv') {
        content = 'Timestamp,User,Action,Entity Type,Entity ID,Description,IP Address\n';
        filteredLogs.forEach(log => {
          content += `"${log.timestamp}","${log.user}","${log.action}","${log.entityType}","${log.entityId}","${log.description}","${log.ipAddress}"\n`;
        });
        downloadFile(content, `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
      } else if (format === 'json') {
        content = JSON.stringify(filteredLogs, null, 2);
        downloadFile(content, `audit-logs-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
      } else if (format === 'pdf') {
        // Placeholder for PDF export
        addToast('PDF export feature coming soon', 'info');
        return;
      }
      
      addToast(`Audit logs exported as ${format.toUpperCase()}`, 'success');
    } catch (err) {
      addToast('Failed to export logs', 'error');
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const uniqueUsers = [...new Set(auditLogs.map(log => log.user))];
  const actionTypes = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT', 'LOGIN'];
  const entityTypes = [...new Set(auditLogs.map(log => log.entityType))];

  return (
    <div className="audit-page">
      <div className="audit-header">
        <h1>📋 Audit Logs</h1>
        <p>Track all system changes and user activities for compliance</p>
      </div>

      <div className="audit-container">
        {/* Filters Sidebar */}
        <div className="audit-filters">
          <div className="filter-card">
            <h3>🔍 Filters</h3>

            <div className="filter-group">
              <label>Search</label>
              <AppInput
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description, ID..."
              />
            </div>

            <div className="filter-group">
              <label>Action</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Actions</option>
                {actionTypes.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Entity Type</label>
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                {entityTypes.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>User</label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Users</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="filter-input"
              />
            </div>

            <AppButton
              onClick={() => {
                setFilterAction('all');
                setFilterEntity('all');
                setFilterUser('all');
                setSearchQuery('');
                setDateFrom('');
                setDateTo('');
              }}
              variant="secondary"
              style={{ width: '100%' }}
            >
              🔄 Clear Filters
            </AppButton>
          </div>

          <div className="export-card">
            <h3>📥 Export</h3>
            <p style={{ fontSize: '0.9em', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              Export {filteredLogs.length} log entries
            </p>
            <AppButton
              onClick={() => exportLogs('csv')}
              variant="secondary"
              style={{ width: '100%', marginBottom: '8px' }}
            >
              📊 CSV
            </AppButton>
            <AppButton
              onClick={() => exportLogs('json')}
              variant="secondary"
              style={{ width: '100%', marginBottom: '8px' }}
            >
              { } JSON
            </AppButton>
            <AppButton
              onClick={() => exportLogs('pdf')}
              variant="secondary"
              style={{ width: '100%' }}
            >
              📄 PDF
            </AppButton>
          </div>
        </div>

        {/* Logs Display */}
        <div className="audit-logs">
          <div className="logs-header">
            <h2>Activity Logs</h2>
            <span className="log-count">{filteredLogs.length} entries</span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="logs-empty">
              <div className="empty-icon">🕵️</div>
              <h3>No Logs Found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            <div className="logs-timeline">
              {filteredLogs.map((log, index) => (
                <div key={log.id} className="log-entry">
                  <div className="log-timeline-dot" style={{ backgroundColor: getActionColor(log.action) }}>
                    {getEntityIcon(log.entityType)}
                  </div>

                  <div className="log-content">
                    <div className="log-header-row">
                      <div className="log-meta">
                        <span className="log-user">👤 {log.user}</span>
                        <span className="log-time">⏰ {formatDate(log.timestamp)}</span>
                      </div>
                      <div className="log-badges">
                        <span
                          className="action-badge"
                          style={{
                            backgroundColor: getActionColor(log.action),
                            color: 'white',
                          }}
                        >
                          {log.action}
                        </span>
                        <span className="entity-badge">
                          {log.entityType}
                        </span>
                      </div>
                    </div>

                    <div className="log-description">
                      <p>{log.description}</p>
                      <code className="log-id">ID: {log.entityId}</code>
                    </div>

                    <div className="log-details">
                      <div className="detail-item">
                        <span className="detail-label">IP Address:</span>
                        <span className="detail-value">{log.ipAddress}</span>
                      </div>
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className="detail-item">
                          <span className="detail-label">Changes:</span>
                          <div className="changes-list">
                            {Object.entries(log.changes).map(([key, value]) => (
                              <div key={key} className="change-item">
                                <code>{key}</code>: {JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {index < filteredLogs.length - 1 && <div className="log-divider"></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditPage;
