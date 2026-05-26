import React, { useState, useEffect } from 'react';
import { getIncomeEntries, MARKETPLACE_SOURCES } from '../utils/incomeAPI';
import { getComparison, getPerformanceKPI } from '../utils/goalsAndMetrics';
import '../styles/ComparisonReport.css';

const ComparisonReportPage = () => {
  const [comparison, setComparison] = useState(null);
  const [kpi, setKPI] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const entries = await getIncomeEntries();
    const comp = await getComparison(entries);
    const kpiData = getPerformanceKPI(entries);
    setComparison(comp);
    setKPI(kpiData);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  if (!comparison || !kpi) return null;

  const growthColor = comparison.growth > 0 ? '#10b981' : '#dc2626';
  const growthIcon = comparison.growth > 0 ? '📈' : '📉';

  return (
    <div className="comparison-report">
      {/* Header */}
      <div className="report-header">
        <div>
          <h1>📊 Laporan Perbandingan</h1>
          <p>Analisis bulan ini vs bulan lalu</p>
        </div>
      </div>

      {/* Growth Summary */}
      <div className="growth-summary">
        <div className="growth-card">
          <div className="growth-header">
            <span className="growth-icon" style={{ fontSize: '2em' }}>{growthIcon}</span>
            <div>
              <h3>Pertumbuhan Penjualan</h3>
              <p>{comparison.lastMonth}</p>
            </div>
          </div>
          <div className="growth-value" style={{ color: growthColor }}>
            {comparison.growth > 0 ? '+' : ''}{comparison.growth.toFixed(1)}%
          </div>
          <div className="growth-detail">
            {formatCurrency(comparison.difference)} 
            <span style={{ fontSize: '0.9em', marginLeft: '8px' }}>
              ({comparison.currentMonth})
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="comparison-cards">
        <div className="comp-card">
          <div className="comp-label">Bulan Lalu ({comparison.lastMonth})</div>
          <div className="comp-value">{formatCurrency(comparison.lastTotal)}</div>
          <div className="comp-subtext">Total penjualan</div>
        </div>

        <div className="comp-arrow">→</div>

        <div className="comp-card current">
          <div className="comp-label">Bulan Ini ({comparison.currentMonth})</div>
          <div className="comp-value">{formatCurrency(comparison.currentTotal)}</div>
          <div className="comp-subtext">Total penjualan</div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="kpi-section">
        <h2>📈 Metrik Performa</h2>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">💰</div>
            <div className="kpi-label">Total Pendapatan</div>
            <div className="kpi-value">{formatCurrency(kpi.totalIncome)}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">📦</div>
            <div className="kpi-label">Total Pesanan</div>
            <div className="kpi-value">{kpi.totalOrders.toLocaleString('id-ID')}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">💵</div>
            <div className="kpi-label">Nilai Order Rata-rata</div>
            <div className="kpi-value">{formatCurrency(kpi.aov)}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">⚡</div>
            <div className="kpi-label">Efisiensi Komisi</div>
            <div className="kpi-value" style={{ color: '#10b981' }}>{kpi.commissionEfficiency}%</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">🎯</div>
            <div className="kpi-label">Conversion Rate</div>
            <div className="kpi-value">{kpi.conversionRate}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">🔝</div>
            <div className="kpi-label">Channel Terbaik</div>
            <div className="kpi-value">
              {kpi.bestMarketplace ? kpi.bestMarketplace.name : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Comparison */}
      <div className="marketplace-comparison">
        <h2>🛍️ Perbandingan per Channel</h2>
        <div className="table-responsive">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th style={{ textAlign: 'right' }}>Bulan Lalu</th>
                <th style={{ textAlign: 'right' }}>Bulan Ini</th>
                <th style={{ textAlign: 'center' }}>Selisih</th>
                <th style={{ textAlign: 'center' }}>Growth</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(comparison.comparisonByMarketplace).map(([code, data]) => {
                const source = MARKETPLACE_SOURCES.find(s => s.code === code);
                const growthColor = data.growth > 0 ? '#10b981' : data.growth < 0 ? '#dc2626' : '#666';
                return (
                  <tr key={code} className={data.current > 0 ? 'has-data' : 'no-data'}>
                    <td>
                      <span style={{ fontSize: '1.2em', marginRight: '8px' }}>{source?.icon}</span>
                      {source?.name}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {formatCurrency(data.last)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(data.current)}
                    </td>
                    <td style={{ textAlign: 'center', color: data.difference > 0 ? '#10b981' : '#dc2626' }}>
                      {data.difference > 0 ? '+' : ''}{formatCurrency(data.difference)}
                    </td>
                    <td style={{ textAlign: 'center', color: growthColor, fontWeight: 600 }}>
                      {data.growth > 0 ? '📈' : data.growth < 0 ? '📉' : '➡️'} {data.growth.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h2>💡 Insight & Rekomendasi</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-title">📊 Overall Performance</div>
            <p>
              {comparison.growth >= 10 ? '🎉 Pertumbuhan sangat baik! ' : comparison.growth >= 0 ? '✅ Pertumbuhan positif. ' : '⚠️ Perlu perhatian. '}
              Penjualan {comparison.growth > 0 ? 'naik' : 'turun'} {Math.abs(comparison.growth).toFixed(1)}% dibanding bulan lalu.
            </p>
          </div>

          <div className="insight-card">
            <div className="insight-title">🏆 Best Performer</div>
            <p>
              {kpi.bestMarketplace 
                ? `${kpi.bestMarketplace.name} adalah channel terbaik dengan penjualan Rp ${(kpi.bestMarketplace.income / 1000000).toFixed(1)}M`
                : 'Belum ada data'}
            </p>
          </div>

          <div className="insight-card">
            <div className="insight-title">⚡ Efficiency Score</div>
            <p>
              Efisiensi komisi {kpi.commissionEfficiency}% sangat {'baik' ? 'baik - terus pertahankan strategi ini!' : 'perlu ditingkatkan'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonReportPage;
