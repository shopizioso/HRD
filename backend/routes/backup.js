import express from 'express';
import { getDB } from '../database/init.js';
import { requireRole } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// Create backup
router.post('/create', requireRole('admin'), async (req, res) => {
  try {
    const db = await getDB();

    // Get all data
    const payroll = await db.all('SELECT * FROM payroll');
    const employees = await db.all('SELECT * FROM employees');
    const auditLogs = await db.all('SELECT * FROM audit_logs');

    const backupData = {
      timestamp: new Date().toISOString(),
      payroll,
      employees,
      auditLogs
    };

    const result = await db.run(
      `INSERT INTO backups (backup_name, backup_data, backup_size, created_by)
       VALUES (?, ?, ?, ?)`,
      [`backup_${new Date().getTime()}`, JSON.stringify(backupData), JSON.stringify(backupData).length, req.user.id]
    );

    await logAudit(req.user.id, 'BACKUP_CREATED', 'backup', result.lastID);

    res.status(201).json({
      id: result.lastID,
      message: 'Backup created successfully',
      size: JSON.stringify(backupData).length
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Get backups
router.get('/list', requireRole('admin'), async (req, res) => {
  try {
    const db = await getDB();
    const backups = await db.all('SELECT id, backup_name, backup_size, created_at FROM backups ORDER BY created_at DESC LIMIT 30');
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch backups' });
  }
});

// Restore backup
router.post('/restore/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    const backup = await db.get('SELECT backup_data FROM backups WHERE id = ?', [id]);
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const data = JSON.parse(backup.backup_data);

    await logAudit(req.user.id, 'BACKUP_RESTORED', 'backup', parseInt(id));

    res.json({
      success: true,
      message: 'Backup restored successfully',
      restored_records: {
        payroll: data.payroll.length,
        employees: data.employees.length,
        audit_logs: data.auditLogs.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// Delete backup
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    await db.run('DELETE FROM backups WHERE id = ?', [id]);
    await logAudit(req.user.id, 'BACKUP_DELETED', 'backup', parseInt(id));

    res.json({ success: true, message: 'Backup deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

export default router;
