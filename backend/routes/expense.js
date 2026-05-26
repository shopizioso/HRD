import express from 'express';
import { getDB } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all expense records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const db = await getDB();

    let query = 'SELECT * FROM expense_records WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY date DESC';

    const records = await db.all(query, params);
    res.json(records);
  } catch (error) {
    console.error('Error fetching expense records:', error);
    res.status(500).json({ error: 'Gagal mengambil data pengeluaran' });
  }
});

// Get expense summary for a date range
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = await getDB();

    let query = `
      SELECT 
        category,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        AVG(amount) as avg_amount
      FROM expense_records
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY category ORDER BY total_amount DESC';

    const summary = await db.all(query, params);
    
    // Get overall total
    const totalQuery = `
      SELECT SUM(amount) as total_expense FROM expense_records WHERE 1=1
    `;
    const params2 = [];
    if (startDate) {
      totalQuery += ' AND date >= ?';
      params2.push(startDate);
    }
    if (endDate) {
      totalQuery += ' AND date <= ?';
      params2.push(endDate);
    }

    const totalResult = await db.get(totalQuery, params2);

    res.json({
      byCategory: summary,
      totalExpense: totalResult?.total_expense || 0
    });
  } catch (error) {
    console.error('Error calculating expense summary:', error);
    res.status(500).json({ error: 'Gagal menghitung ringkasan pengeluaran' });
  }
});

// Add new expense record
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, category, description, amount, notes } = req.body;
    const userId = req.user?.id || 1;
    const db = await getDB();

    const result = await db.run(
      `INSERT INTO expense_records (date, category, description, amount, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [date, category, description, amount, notes || null, userId]
    );

    res.status(201).json({
      id: result.lastID,
      date,
      category,
      description,
      amount,
      notes,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding expense record:', error);
    res.status(500).json({ error: 'Gagal menambahkan pengeluaran' });
  }
});

// Update expense record
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, category, description, amount, notes } = req.body;
    const db = await getDB();

    await db.run(
      `UPDATE expense_records 
       SET date = ?, category = ?, description = ?, amount = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [date, category, description, amount, notes || null, id]
    );

    const updated = await db.get('SELECT * FROM expense_records WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('Error updating expense record:', error);
    res.status(500).json({ error: 'Gagal memperbarui pengeluaran' });
  }
});

// Delete expense record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    await db.run('DELETE FROM expense_records WHERE id = ?', [id]);
    res.json({ success: true, message: 'Pengeluaran berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting expense record:', error);
    res.status(500).json({ error: 'Gagal menghapus pengeluaran' });
  }
});

// Get daily expense report
router.get('/report/daily', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = await getDB();

    let query = `
      SELECT 
        date,
        category,
        COUNT(*) as transaction_count,
        SUM(amount) as daily_total
      FROM expense_records
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY date, category ORDER BY date DESC';

    const report = await db.all(query, params);
    res.json(report);
  } catch (error) {
    console.error('Error generating daily expense report:', error);
    res.status(500).json({ error: 'Gagal membuat laporan harian' });
  }
});

// Export expenses as CSV
router.get('/export/csv', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const db = await getDB();

    let query = 'SELECT * FROM expense_records WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY date DESC';

    const records = await db.all(query, params);

    let csv = 'Tanggal,Kategori,Deskripsi,Jumlah,Catatan\n';
    records.forEach(r => {
      csv += `"${r.date}","${r.category}","${r.description}","${r.amount}","${r.notes || ''}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pengeluaran.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting expenses:', error);
    res.status(500).json({ error: 'Gagal mengexport data' });
  }
});

export default router;
