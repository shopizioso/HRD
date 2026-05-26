/**
 * Audit Log System
 * Tracks all changes to sensitive data for compliance
 */

export class AuditLog {
  constructor() {
    this.logs = this.loadLogs();
  }

  // Load logs from localStorage
  loadLogs() {
    try {
      const stored = localStorage.getItem('audit_logs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load audit logs:', e);
      return [];
    }
  }

  // Save logs to localStorage
  saveLogs() {
    try {
      localStorage.setItem('audit_logs', JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to save audit logs:', e);
    }
  }

  // Create log entry
  log(action, {
    entity,
    entityId,
    userId,
    userName,
    changes,
    ipAddress = 'unknown',
    userAgent = navigator.userAgent,
    status = 'success',
    reason = '',
  }) {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      entity,
      entityId,
      userId,
      userName,
      changes, // {field: {before, after}}
      ipAddress,
      userAgent,
      status,
      reason,
    };

    this.logs.push(entry);
    this.saveLogs();

    // Keep only last 10000 logs
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-10000);
      this.saveLogs();
    }

    return entry;
  }

  // Get logs with filtering
  getLogs({
    action = null,
    entity = null,
    entityId = null,
    userId = null,
    startDate = null,
    endDate = null,
    limit = 100,
  } = {}) {
    let filtered = [...this.logs];

    if (action) {
      filtered = filtered.filter(log => log.action === action);
    }
    if (entity) {
      filtered = filtered.filter(log => log.entity === entity);
    }
    if (entityId) {
      filtered = filtered.filter(log => log.entityId === entityId);
    }
    if (userId) {
      filtered = filtered.filter(log => log.userId === userId);
    }
    if (startDate) {
      const start = new Date(startDate).getTime();
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime();
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() <= end);
    }

    // Return most recent first, limited
    return filtered.reverse().slice(0, limit);
  }

  // Export logs
  exportLogs(filters = {}) {
    const logs = this.getLogs({ ...filters, limit: 100000 });
    return logs.map(log => ({
      Waktu: log.timestamp,
      Aksi: log.action,
      Entitas: log.entity,
      'ID Entitas': log.entityId,
      'User ID': log.userId,
      'Nama User': log.userName,
      Perubahan: JSON.stringify(log.changes),
      Status: log.status,
      Alasan: log.reason,
    }));
  }

  // Get summary statistics
  getStatistics() {
    return {
      total: this.logs.length,
      byAction: this.groupBy(this.logs, 'action'),
      byEntity: this.groupBy(this.logs, 'entity'),
      byUser: this.groupBy(this.logs, 'userId'),
      recentActivity: this.logs.slice(-10).reverse(),
    };
  }

  groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      const val = item[key];
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  }

  // Clear old logs (retention policy)
  clearOldLogs(daysToKeep = 90) {
    const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const oldCount = this.logs.length;
    
    this.logs = this.logs.filter(
      log => new Date(log.timestamp).getTime() > cutoff
    );
    
    this.saveLogs();
    
    return {
      removed: oldCount - this.logs.length,
      remaining: this.logs.length,
    };
  }
}

// Singleton instance
const auditLog = new AuditLog();

export default auditLog;

/**
 * Helper function to track changes
 */
export function trackChanges(before, after) {
  const changes = {};
  
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  for (const key of allKeys) {
    const beforeVal = before?.[key];
    const afterVal = after?.[key];
    
    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      changes[key] = {
        before: beforeVal,
        after: afterVal,
      };
    }
  }

  return changes;
}
