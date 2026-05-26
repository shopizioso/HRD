import express from 'express';
import nodemailer from 'nodemailer';
import { getDB } from '../database/init.js';

const router = express.Router();

// Configure email transporter
// TODO: Replace with actual email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

/**
 * GET /api/reports/email-config
 * Get email report configuration
 */
router.get('/email-config', async (req, res) => {
  try {
    const db = getDB();
    const config = db.prepare('SELECT * FROM email_reports_config WHERE user_id = ?').get(req.userId);
    
    if (!config) {
      return res.json({
        recipientEmail: '',
        frequency: 'weekly',
        enabled: false,
        includeCharts: true
      });
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reports/email-config
 * Save email report configuration
 */
router.post('/email-config', async (req, res) => {
  try {
    const { recipientEmail, frequency, enabled, includeCharts } = req.body;
    const db = getDB();

    db.prepare(`
      INSERT INTO email_reports_config (user_id, recipient_email, frequency, enabled, include_charts, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        recipient_email = excluded.recipient_email,
        frequency = excluded.frequency,
        enabled = excluded.enabled,
        include_charts = excluded.include_charts,
        updated_at = CURRENT_TIMESTAMP
    `).run(req.userId, recipientEmail, frequency, enabled, includeCharts);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reports/send-email
 * Send income report via email immediately
 */
router.post('/send-email', async (req, res) => {
  try {
    const { recipientEmail, includeCharts } = req.body;
    const db = getDB();

    // Get income data for current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const entries = db.prepare(`
      SELECT * FROM income_records 
      WHERE created_by = ? AND date LIKE ?
      ORDER BY date DESC
    `).all(req.userId, `${currentMonth}%`);

    // Calculate summary
    const summary = {
      totalIncome: entries.reduce((sum, e) => sum + (e.amount || 0), 0),
      totalOrders: entries.reduce((sum, e) => sum + (e.orders || 0), 0),
      totalCommission: entries.reduce((sum, e) => sum + (e.commission || 0), 0),
      averageValue: entries.length > 0 ? entries.reduce((sum, e) => sum + (e.amount || 0), 0) / entries.length : 0
    };

    // Group by marketplace
    const byMarketplace = {};
    entries.forEach(e => {
      if (!byMarketplace[e.marketplace]) {
        byMarketplace[e.marketplace] = { count: 0, amount: 0, orders: 0, commission: 0 };
      }
      byMarketplace[e.marketplace].count++;
      byMarketplace[e.marketplace].amount += e.amount || 0;
      byMarketplace[e.marketplace].orders += e.orders || 0;
      byMarketplace[e.marketplace].commission += e.commission || 0;
    });

    // Build email HTML
    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0; }
            .summary-card { background: #f5f5f5; padding: 16px; border-radius: 8px; text-align: center; }
            .card-value { font-size: 1.8em; font-weight: bold; color: #667eea; }
            .card-label { font-size: 0.85em; color: #666; margin-top: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: bold; }
            .footer { text-align: center; color: #999; font-size: 0.9em; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Laporan Pendapatan Bulanan</h1>
              <p>Periode: ${currentMonth}</p>
            </div>

            <div class="summary-grid">
              <div class="summary-card">
                <div class="card-value">Rp ${summary.totalIncome.toLocaleString('id-ID')}</div>
                <div class="card-label">Total Penjualan</div>
              </div>
              <div class="summary-card">
                <div class="card-value">${summary.totalOrders}</div>
                <div class="card-label">Total Pesanan</div>
              </div>
              <div class="summary-card">
                <div class="card-value">Rp ${summary.totalCommission.toLocaleString('id-ID')}</div>
                <div class="card-label">Total Komisi</div>
              </div>
              <div class="summary-card">
                <div class="card-value">Rp ${Math.round(summary.averageValue).toLocaleString('id-ID')}</div>
                <div class="card-label">Rata-rata Order</div>
              </div>
            </div>

            <h2>Breakdown Marketplace</h2>
            <table>
              <thead>
                <tr>
                  <th>Marketplace</th>
                  <th>Transaksi</th>
                  <th>Penjualan</th>
                  <th>Komisi</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(byMarketplace).map(([marketplace, data]) => `
                  <tr>
                    <td>${marketplace}</td>
                    <td>${data.count}</td>
                    <td>Rp ${data.amount.toLocaleString('id-ID')}</td>
                    <td>Rp ${data.commission.toLocaleString('id-ID')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>Email ini dikirim otomatis dari sistem HR & Payroll</p>
              <p>${new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@hrpayroll.com',
      to: recipientEmail,
      subject: `Laporan Pendapatan - ${currentMonth}`,
      html: htmlContent
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reports/schedule-email
 * Schedule automated email reports
 */
router.post('/schedule-email', async (req, res) => {
  try {
    const { frequency, recipientEmail } = req.body;
    // TODO: Implement scheduled task using node-cron or bull queue
    
    res.json({ 
      success: true, 
      message: `Email reports scheduled untuk ${frequency}`,
      nextSend: getNextScheduleDate(frequency)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getNextScheduleDate(frequency) {
  const now = new Date();
  
  if (frequency === 'daily') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0);
    return tomorrow;
  } else if (frequency === 'weekly') {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + ((1 + 7 - nextWeek.getDay()) % 7));
    nextWeek.setHours(9, 0, 0, 0);
    return nextWeek;
  } else if (frequency === 'monthly') {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(9, 0, 0, 0);
    return nextMonth;
  }
}

export default router;
