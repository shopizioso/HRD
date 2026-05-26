import express from 'express';
import { getDB } from '../database/init.js';
import { requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Generate payroll report
router.get('/payroll', requirePermission('view_reports'), async (req, res) => {
  try {
    const { month, year } = req.query;
    const db = await getDB();

    const payroll = await db.all(`
      SELECT p.*, e.id as emp_id, u.first_name, u.last_name, u.department
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      WHERE p.month = ? AND p.year = ?
    `, [month, year]);

    const summary = {
      month: parseInt(month),
      year: parseInt(year),
      totalEmployees: payroll.length,
      totalGross: payroll.reduce((sum, p) => sum + (p.basic_salary + p.allowances), 0),
      totalDeductions: payroll.reduce((sum, p) => sum + (p.bpjs + p.pph_21 + p.deductions), 0),
      totalNet: payroll.reduce((sum, p) => sum + (p.net_salary || 0), 0),
      records: payroll
    };

    res.json(summary);
  } catch (error) {
    console.error('Error generating payroll report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Generate department report
router.get('/department', requirePermission('view_reports'), async (req, res) => {
  try {
    const db = await getDB();

    const byDept = await db.all(`
      SELECT 
        u.department,
        COUNT(*) as employee_count,
        SUM(p.basic_salary) as total_salary,
        SUM(p.bpjs + p.pph_21 + p.deductions) as total_deductions,
        SUM(p.net_salary) as total_net
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      GROUP BY u.department
    `);

    res.json(byDept);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate department report' });
  }
});

// Export report as CSV
router.post('/export/csv', requirePermission('view_reports'), async (req, res) => {
  try {
    const { month, year, type } = req.body;
    const db = await getDB();

    let data = [];
    if (type === 'payroll') {
      data = await db.all(`
        SELECT u.first_name, u.last_name, p.basic_salary, p.allowances, p.bpjs, p.pph_21, p.net_salary
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
        JOIN users u ON e.user_id = u.id
        WHERE p.month = ? AND p.year = ?
      `, [month, year]);
    }

    // Convert to CSV
    const headers = Object.keys(data[0] || {});
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
      csv += headers.map(h => row[h]).join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report-${month}-${year}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export report' });
  }
});

export default router;
