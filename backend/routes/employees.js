import express from 'express';
import { getDB } from '../database/init.js';
import { requireRole, requirePermission } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// Get all employees
router.get('/', requirePermission('view_employees'), async (req, res) => {
  try {
    const db = await getDB();
    const employees = await db.all(`
      SELECT e.*, u.first_name, u.last_name, u.email, u.role, u.department, u.position
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE u.is_active = 1
    `);

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/:id', requirePermission('view_employees'), async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    
    const employee = await db.get(`
      SELECT e.*, u.first_name, u.last_name, u.email, u.role, u.department, u.position
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = ?
    `, [id]);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create employee
router.post('/', requireRole('admin', 'hr'), async (req, res) => {
  try {
    const { user_id, nik, nip, bank_name, bank_account, address, phone } = req.body;
    const db = await getDB();

    const result = await db.run(
      `INSERT INTO employees (user_id, nik, nip, bank_name, bank_account, address, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, nik, nip, bank_name, bank_account, address, phone]
    );

    await logAudit(req.user.id, 'EMPLOYEE_CREATED', 'employee', result.lastID, req.body);

    res.status(201).json({ id: result.lastID, ...req.body });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/:id', requireRole('admin', 'hr'), async (req, res) => {
  try {
    const { id } = req.params;
    const { bank_name, bank_account, address, phone } = req.body;
    const db = await getDB();

    await db.run(
      `UPDATE employees SET bank_name = ?, bank_account = ?, address = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [bank_name, bank_account, address, phone, id]
    );

    await logAudit(req.user.id, 'EMPLOYEE_UPDATED', 'employee', parseInt(id), req.body);

    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    await db.run('UPDATE employees SET is_active = 0 WHERE id = ?', [id]);
    await logAudit(req.user.id, 'EMPLOYEE_DELETED', 'employee', parseInt(id));

    res.json({ success: true, message: 'Employee deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;
