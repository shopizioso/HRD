import React, { useState, useEffect } from 'react';
import { getIncomeEntries, getIncomeSummary, MARKETPLACE_SOURCES } from '../utils/incomeAPI';
import IncomeCharts from '../components/IncomeCharts';
import '../styles/IncomeCharts.css';

const IncomeReportPage = () => {
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    updateSummary();
  }, [monthYear]);

  const updateSummary = async () => {
    const [year, month] = monthYear.split('-');
    const startDate = monthYear + '-01';
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
    
    const entries = await getIncomeEntries();
    const filtered = entries.filter(e => e.date >= startDate && e.date <= endDate);

    const monthSummary = {};
    let totalIncome = 0;
    let totalCommission = 0;
    let totalOrders = 0;

    MARKETPLACE_SOURCES.forEach(source => {
      monthSummary[source.code] = {
        name: source.name,
        icon: source.icon,
        total: 0,
        commission: 0,
        orders: 0,
        count: 0,
      };
    });

    filtered.forEach(entry => {
      const source = entry.marketplace || 'other';
      if (monthSummary[source]) {
        monthSummary[source].total += entry.amount || 0;
        monthSummary[source].commission += entry.commission || 0;
        monthSummary[source].orders += entry.orders || 0;
        monthSummary[source].count++;
      }
      totalIncome += entry.amount || 0;
      totalCommission += entry.commission || 0;
      totalOrders += entry.orders || 0;
    });

    setSummary({
      monthSummary,
      totalIncome,
      totalCommission,
      netIncome: totalIncome - totalCommission,
      totalOrders,
      transactionCount: filtered.length,
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  if (!summary) return null;

  const [month, year] = monthYear.split('-');
  const monthDate = new Date(year, month - 1, 1);

  return (
    <div className="income-report">
      {/* Header */}
      <div className="report-header">
        <div>
          <h1>📊 Laporan Pendapatan</h1>
          <p>Analisis detail penjualan dan komisi per marketplace</p>
        </div>
        <div className="header-controls">
          <input
            type="month"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            className="month-input"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Total Pendapatan</div>
            <div className="card-value" style={{ color: '#2563eb' }}>
              {formatCurrency(summary.totalIncome)}
            </div>
            <div className="card-subtext">{summary.transactionCount} transaksi</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <div className="card-label">Total Komisi</div>
            <div className="card-value" style={{ color: '#dc2626' }}>
              {formatCurrency(summary.totalCommission)}
            </div>
            <div className="card-subtext">{((summary.totalCommission / summary.totalIncome) * 100 || 0).toFixed(1)}% dari pendapatan</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <div className="card-label">Pendapatan Bersih</div>
            <div className="card-value" style={{ color: '#16a34a' }}>
              {formatCurrency(summary.netIncome)}
            </div>
            <div className="card-subtext">Setelah komisi</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <div className="card-label">Total Order</div>
            <div className="card-value" style={{ color: '#7c3aed' }}>
              {summary.totalOrders.toLocaleString('id-ID')}
            </div>
            <div className="card-subtext">Rata-rata: {(summary.totalOrders / (summary.transactionCount || 1)).toFixed(1)} order/transaksi</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <IncomeCharts month={parseInt(month) - 1} year={parseInt(year)} />

      {/* Marketplace Detail Table */}
      <div className="marketplace-detail">
        <h2>📋 Detail Per Marketplace</h2>
        <div className="table-responsive">
          <table className="detail-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th style={{ textAlign: 'right' }}>Penjualan</th>
                <th style={{ textAlign: 'center' }}>Order</th>
                <th style={{ textAlign: 'right' }}>Komisi</th>
                <th style={{ textAlign: 'right' }}>Bersih</th>
                <th style={{ textAlign: 'center' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.monthSummary).map(([code, data]) => {
                if (data.total === 0) return null;
                const percentage = ((data.total / summary.totalIncome) * 100).toFixed(1);
                return (
                  <tr key={code}>
                    <td>
                      <span style={{ fontSize: '1.2em', marginRight: '8px' }}>{data.icon}</span>
                      <strong>{data.name}</strong>
                      <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>
                        {data.count} transaksi
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', color: '#2563eb', fontWeight: 600 }}>
                      {formatCurrency(data.total)}
                    </td>
                    <td style={{ textAlign: 'center' }}>{data.orders}</td>
                    <td style={{ textAlign: 'right', color: '#dc2626' }}>
                      {formatCurrency(data.commission)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
                      {formatCurrency(data.total - data.commission)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: 700, backgroundColor: 'var(--background)', borderTop: '2px solid var(--border)' }}>
                <td>Total</td>
                <td style={{ textAlign: 'right', color: '#2563eb' }}>
                  {formatCurrency(summary.totalIncome)}
                </td>
                <td style={{ textAlign: 'center' }}>{summary.totalOrders}</td>
                <td style={{ textAlign: 'right', color: '#dc2626' }}>
                  {formatCurrency(summary.totalCommission)}
                </td>
                <td style={{ textAlign: 'right', color: '#16a34a' }}>
                  {formatCurrency(summary.netIncome)}
                </td>
                <td style={{ textAlign: 'center' }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Income Analysis */}
      <div className="analysis-section">
        <h2>📈 Analisis Pendapatan</h2>
        <div className="analysis-grid">
          <div className="analysis-card">
            <div className="analysis-title">💡 Insight Utama</div>
            <ul className="insight-list">
              <li>
                <strong>Channel Terbaik:</strong>{' '}
                {(() => {
                  const best = Object.entries(summary.monthSummary).reduce((a, b) => (a[1].total > b[1].total ? a : b));
                  return best && best[1].total > 0 ? `${best[1].icon} ${best[1].name}` : 'N/A';
                })()}
              </li>
              <li>
                <strong>Rata-rata Penjualan/Hari:</strong> {formatCurrency(summary.totalIncome / 30)}
              </li>
              <li>
                <strong>Efisiensi Komisi:</strong> {((summary.totalCommission / summary.totalIncome) * 100 || 0).toFixed(1)}%
              </li>
              <li>
                <strong>AOV (Average Order Value):</strong> {formatCurrency(summary.totalIncome / (summary.totalOrders || 1))}
              </li>
            </ul>
          </div>

          <div className="analysis-card">
            <div className="analysis-title">📊 Tren Komisi</div>
            <div className="commission-info">
              <div className="info-item">
                <span>Tertinggi:</span>
                <strong>
                  {(() => {
                    const highest = Object.entries(summary.monthSummary).reduce((a, b) => 
                      (a[1].commission > b[1].commission ? a : b)
                    );
                    return highest && highest[1].commission > 0 ? highest[1].name : 'N/A';
                  })()}
                </strong>
              </div>
              <div className="info-item">
                <span>Persentase Komisi:</span>
                <strong>{((summary.totalCommission / summary.totalIncome) * 100 || 0).toFixed(2)}%</strong>
              </div>
              <div className="info-item">
                <span>Total Biaya:</span>
                <strong style={{ color: '#dc2626' }}>{formatCurrency(summary.totalCommission)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeReportPage;
