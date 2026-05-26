import express from 'express';
import { getDB } from '../database/init.js';

const router = express.Router();

// Get all income records with optional filters
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, marketplace } = req.query;
    const db = await getDB();

    let query = 'SELECT * FROM income_records WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    if (marketplace && marketplace !== 'all') {
      query += ' AND marketplace = ?';
      params.push(marketplace);
    }

    query += ' ORDER BY date DESC';

    const records = await db.all(query, params);
    res.json(records);
  } catch (error) {
    console.error('Error fetching income records:', error);
    res.status(500).json({ error: 'Gagal mengambil data pendapatan' });
  }
});

// Get income summary for a date range
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = await getDB();

    let query = `
      SELECT 
        marketplace,
        SUM(amount) as total_amount,
        SUM(commission) as total_commission,
        SUM(orders) as total_orders,
        COUNT(*) as transaction_count
      FROM income_records
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

    query += ' GROUP BY marketplace ORDER BY total_amount DESC';

    const summary = await db.all(query, params);
    
    const totalIncome = summary.reduce((sum, item) => sum + (item.total_amount || 0), 0);
    const totalCommission = summary.reduce((sum, item) => sum + (item.total_commission || 0), 0);
    const totalOrders = summary.reduce((sum, item) => sum + (item.total_orders || 0), 0);
    
    res.json({
      summary,
      totalIncome,
      totalCommission,
      netIncome: totalIncome - totalCommission,
      totalOrders,
    });
  } catch (error) {
    console.error('Error fetching income summary:', error);
    res.status(500).json({ error: 'Gagal mengambil ringkasan pendapatan' });
  }
});

// Create new income record
router.post('/', async (req, res) => {
  try {
    const { date, marketplace, amount, orders, commission, notes } = req.body;
    const userId = req.user?.id;

    if (!date || !marketplace || amount === undefined) {
      return res.status(400).json({
        error: 'Tanggal, marketplace, dan penjualan harus diisi'
      });
    }

    const db = await getDB();
    const result = await db.run(
      `INSERT INTO income_records (date, marketplace, amount, orders, commission, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, marketplace, amount, orders || 0, commission || 0, notes || null, userId]
    );

    res.status(201).json({
      id: result.lastID,
      date,
      marketplace,
      amount,
      orders: orders || 0,
      commission: commission || 0,
      notes,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating income record:', error);
    res.status(500).json({ error: 'Gagal menyimpan data pendapatan' });
  }
});

// Update income record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, marketplace, amount, orders, commission, notes } = req.body;
    const db = await getDB();

    const result = await db.run(
      `UPDATE income_records 
       SET date = ?, marketplace = ?, amount = ?, orders = ?, commission = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [date, marketplace, amount, orders || 0, commission || 0, notes || null, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }

    res.json({
      id: parseInt(id),
      date,
      marketplace,
      amount,
      orders: orders || 0,
      commission: commission || 0,
      notes,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating income record:', error);
    res.status(500).json({ error: 'Gagal mengubah data pendapatan' });
  }
});

// Delete income record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    const result = await db.run(
      'DELETE FROM income_records WHERE id = ?',
      [id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }

    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting income record:', error);
    res.status(500).json({ error: 'Gagal menghapus data pendapatan' });
  }
});

// Get daily income report
router.get('/report/daily', async (req, res) => {
  try {
    const { month, year } = req.query;
    const db = await getDB();

    const query = `
      SELECT 
        date,
        marketplace,
        SUM(amount) as amount,
        SUM(commission) as commission,
        SUM(orders) as orders
      FROM income_records
      WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
      GROUP BY date, marketplace
      ORDER BY date DESC, marketplace
    `;

    const records = await db.all(query, [String(month).padStart(2, '0'), year]);
    res.json(records);
  } catch (error) {
    console.error('Error fetching daily report:', error);
    res.status(500).json({ error: 'Gagal mengambil laporan harian' });
  }
});

// Export income data as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = await getDB();

    let query = 'SELECT date, marketplace, amount, orders, commission, notes FROM income_records WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC';

    const records = await db.all(query, params);

    let csv = 'Tanggal,Marketplace,Penjualan,Pesanan,Komisi,Catatan\n';
    records.forEach(record => {
      const note = (record.notes || '').replace(/"/g, '""');
      csv += `"${record.date}","${record.marketplace}","${record.amount}","${record.orders}","${record.commission}","${note}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv;charset=utf-8;');
    res.setHeader('Content-Disposition', `attachment;filename=income-${startDate}-to-${endDate}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Gagal export data' });
  }
});

export default router;
