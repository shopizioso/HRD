/**
 * Data Backup & Restore System
 * Manages JSON export/import of all application data
 */

export class BackupManager {
  /**
   * Create a full backup
   */
  static createBackup() {
    try {
      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          slips: localStorage.getItem('payrollSlip_autosave'),
          auditLogs: localStorage.getItem('audit_logs'),
          settings: localStorage.getItem('app_settings'),
          theme: localStorage.getItem('app-theme'),
          language: localStorage.getItem('app-language'),
        },
      };

      return backup;
    } catch (err) {
      throw new Error('Backup creation failed: ' + err.message);
    }
  }

  /**
   * Export backup as JSON file
   */
  static exportBackup(filename = `backup-${Date.now()}.json`) {
    try {
      const backup = this.createBackup();
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Restore from backup data
   */
  static restoreBackup(backupData, options = {}) {
    const {
      overwrite = false,
      selectiveRestore = [],
    } = options;

    try {
      if (!backupData || !backupData.data) {
        throw new Error('Invalid backup format');
      }

      // If not overwriting, create temporary keys
      const prefix = overwrite ? '' : `_restored_${Date.now()}_`;

      // Restore slips
      if (!selectiveRestore.length || selectiveRestore.includes('slips')) {
        if (backupData.data.slips) {
          localStorage.setItem(
            `${prefix}payrollSlip_autosave`,
            backupData.data.slips
          );
        }
      }

      // Restore audit logs
      if (!selectiveRestore.length || selectiveRestore.includes('auditLogs')) {
        if (backupData.data.auditLogs) {
          localStorage.setItem(
            `${prefix}audit_logs`,
            backupData.data.auditLogs
          );
        }
      }

      // Restore settings
      if (!selectiveRestore.length || selectiveRestore.includes('settings')) {
        if (backupData.data.settings) {
          localStorage.setItem(
            `${prefix}app_settings`,
            backupData.data.settings
          );
        }
      }

      return {
        success: true,
        message: overwrite
          ? 'Data restored successfully'
          : 'Data restored as temporary copies (not overwriting)',
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Import backup from file
   */
  static importBackupFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          const result = this.restoreBackup(backup, { overwrite: false });
          resolve(result);
        } catch (err) {
          reject(new Error('Failed to parse backup file: ' + err.message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read backup file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Get backup statistics
   */
  static getBackupStats() {
    const backup = this.createBackup();
    const stats = {
      timestamp: backup.timestamp,
      size: new Blob([JSON.stringify(backup)]).size,
      items: {},
    };

    // Count items in each category
    if (backup.data.slips) {
      try {
        const slips = JSON.parse(backup.data.slips);
        stats.items.slips = 1;
      } catch (e) {
        stats.items.slips = 0;
      }
    }

    if (backup.data.auditLogs) {
      try {
        const logs = JSON.parse(backup.data.auditLogs);
        stats.items.auditLogs = Array.isArray(logs) ? logs.length : 0;
      } catch (e) {
        stats.items.auditLogs = 0;
      }
    }

    return stats;
  }

  /**
   * Schedule automatic backups
   */
  static scheduleAutoBackup(intervalMinutes = 60) {
    const interval = intervalMinutes * 60 * 1000;
    
    return setInterval(() => {
      const backup = this.createBackup();
      localStorage.setItem(
        `auto_backup_${Date.now()}`,
        JSON.stringify(backup)
      );
      
      // Keep only last 30 auto backups
      const allBackups = Object.keys(localStorage)
        .filter(key => key.startsWith('auto_backup_'))
        .sort();
      
      if (allBackups.length > 30) {
        for (let i = 0; i < allBackups.length - 30; i++) {
          localStorage.removeItem(allBackups[i]);
        }
      }
    }, interval);
  }

  /**
   * List all available backups
   */
  static listAutoBackups() {
    const backups = Object.keys(localStorage)
      .filter(key => key.startsWith('auto_backup_'))
      .map(key => ({
        key,
        timestamp: new Date(parseInt(key.replace('auto_backup_', ''))),
        size: localStorage.getItem(key).length,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    return backups;
  }
}
