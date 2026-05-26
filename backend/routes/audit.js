import express from 'express';
import { getDB } from '../database/init.js';
import { requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Get audit logs
router.get('/', requirePermission('view_audit'), async (req, res) => {
  try {
    const { action, entity_type, user_id, limit = 100, offset = 0 } = req.query;
    const db = await getDB();

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }

    if (entity_type) {
      query += ' AND entity_type = ?';
      params.push(entity_type);
    }

    if (user_id) {
      query += ' AND user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const logs = await db.all(query, params);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Export audit logs
router.post('/export', requirePermission('view_audit'), async (req, res) => {
  try {
    const { format = 'json' } = req.body;
    const db = await getDB();

    const logs = await db.all('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1000');

    if (format === 'csv') {
      const headers = ['id', 'user_id', 'action', 'entity_type', 'entity_id', 'created_at'];
      let csv = headers.join(',') + '\n';
      logs.forEach(log => {
        csv += [log.id, log.user_id, log.action, log.entity_type, log.entity_id, log.created_at].join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.json"');
      res.send(JSON.stringify(logs, null, 2));
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

// Get audit statistics
router.get('/stats', requirePermission('view_audit'), async (req, res) => {
  try {
    const db = await getDB();

    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT action) as unique_actions,
        COUNT(DISTINCT entity_type) as unique_entities
      FROM audit_logs
    `);

    const byAction = await db.all(`
      SELECT action, COUNT(*) as count
      FROM audit_logs
      GROUP BY action
      ORDER BY count DESC
    `);

    res.json({
      ...stats,
      by_action: byAction
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
