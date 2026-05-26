import express from 'express';
import { getDB } from '../database/init.js';
import { requireRole, requirePermission } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// Get all payroll records
router.get('/', requirePermission('view_payroll'), async (req, res) => {
  try {
    const { month, year, employee_id } = req.query;
    const db = await getDB();

    let query = 'SELECT p.*, e.user_id, u.first_name, u.last_name FROM payroll p JOIN employees e ON p.employee_id = e.id JOIN users u ON e.user_id = u.id WHERE 1=1';
    const params = [];

    if (month && year) {
      query += ' AND p.month = ? AND p.year = ?';
      params.push(month, year);
    }

    if (employee_id) {
      query += ' AND p.employee_id = ?';
      params.push(employee_id);
    }

    const payroll = await db.all(query, params);
    res.json(payroll);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
});

// Create payroll record
router.post('/', requirePermission('manage_payroll'), async (req, res) => {
  try {
    const { employee_id, month, year, basic_salary, allowances, deductions } = req.body;
    const db = await getDB();

    const result = await db.run(
      `INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, month, year, basic_salary, allowances, deductions, req.user.id]
    );

    await logAudit(req.user.id, 'PAYROLL_CREATED', 'payroll', result.lastID, req.body);

    res.status(201).json({
      id: result.lastID,
      employee_id,
      month,
      year,
      basic_salary,
      allowances,
      deductions
    });
  } catch (error) {
    console.error('Error creating payroll:', error);
    res.status(500).json({ error: 'Failed to create payroll' });
  }
});

// Update payroll record
router.put('/:id', requirePermission('manage_payroll'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, basic_salary, allowances, deductions, notes } = req.body;
    const db = await getDB();

    await db.run(
      `UPDATE payroll SET status = ?, basic_salary = ?, allowances = ?, deductions = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, basic_salary, allowances, deductions, notes, id]
    );

    await logAudit(req.user.id, 'PAYROLL_UPDATED', 'payroll', parseInt(id), req.body);

    res.json({ success: true, id });
  } catch (error) {
    console.error('Error updating payroll:', error);
    res.status(500).json({ error: 'Failed to update payroll' });
  }
});

// Approve payroll
router.put('/:id/approve', requireRole('admin', 'hr'), async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    await db.run(
      `UPDATE payroll SET status = 'approved', approved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [req.user.id, id]
    );

    await logAudit(req.user.id, 'PAYROLL_APPROVED', 'payroll', parseInt(id));

    res.json({ success: true, message: 'Payroll approved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve payroll' });
  }
});

// Delete payroll
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    await db.run('DELETE FROM payroll WHERE id = ?', [id]);
    await logAudit(req.user.id, 'PAYROLL_DELETED', 'payroll', parseInt(id));

    res.json({ success: true, message: 'Payroll deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payroll' });
  }
});

export default router;
