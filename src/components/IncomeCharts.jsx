import React, { useState, useEffect } from 'react';
import { getIncomeEntries, MARKETPLACE_SOURCES } from '../utils/incomeAPI';

const IncomeCharts = ({ month, year }) => {
  const [chartData, setChartData] = useState(null);
  const [selectedChart, setSelectedChart] = useState('daily');

  useEffect(() => {
    generateChartData();
  }, [month, year]);

  const generateChartData = async () => {
    const entries = await getIncomeEntries();
    const currentMonthEntries = entries.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    // Daily trend data
    const dailyData = {};
    currentMonthEntries.forEach(entry => {
      const day = new Date(entry.date).getDate();
      if (!dailyData[day]) {
        dailyData[day] = { amount: 0, commission: 0, orders: 0 };
      }
      dailyData[day].amount += entry.amount || 0;
      dailyData[day].commission += entry.commission || 0;
      dailyData[day].orders += entry.orders || 0;
    });

    // Marketplace breakdown
    const marketplaceData = {};
    MARKETPLACE_SOURCES.forEach(source => {
      marketplaceData[source.code] = {
        name: source.name,
        icon: source.icon,
        amount: 0,
        commission: 0,
        orders: 0,
      };
    });

    currentMonthEntries.forEach(entry => {
      const marketplace = entry.marketplace || 'other';
      if (marketplaceData[marketplace]) {
        marketplaceData[marketplace].amount += entry.amount || 0;
        marketplaceData[marketplace].commission += entry.commission || 0;
        marketplaceData[marketplace].orders += entry.orders || 0;
      }
    });

    setChartData({
      daily: Object.entries(dailyData)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([day, data]) => ({
          day: parseInt(day),
          ...data,
        })),
      marketplace: Object.values(marketplaceData).filter(m => m.amount > 0),
    });
  };

  if (!chartData) return null;

  const maxDailyAmount = Math.max(...chartData.daily.map(d => d.amount), 1);
  const maxMarketplaceAmount = Math.max(...chartData.marketplace.map(m => m.amount), 1);

  return (
    <div className="income-charts">
      {/* Chart Selector */}
      <div className="chart-selector">
        <button
          className={`chart-btn ${selectedChart === 'daily' ? 'active' : ''}`}
          onClick={() => setSelectedChart('daily')}
        >
          📈 Trend Harian
        </button>
        <button
          className={`chart-btn ${selectedChart === 'marketplace' ? 'active' : ''}`}
          onClick={() => setSelectedChart('marketplace')}
        >
          🛍️ Per Marketplace
        </button>
      </div>

      {/* Daily Trend Chart */}
      {selectedChart === 'daily' && (
        <div className="chart-container">
          <h3>Trend Penjualan Harian</h3>
          <div className="bar-chart">
            {chartData.daily.length > 0 ? (
              <>
                <div className="chart-bars">
                  {chartData.daily.map((item) => (
                    <div key={item.day} className="bar-wrapper">
                      <div className="bar-container">
                        <div
                          className="bar"
                          style={{
                            height: `${(item.amount / maxDailyAmount) * 100}%`,
                          }}
                          title={`Rp ${item.amount.toLocaleString('id-ID')}`}
                        >
                          <span className="bar-value">
                            {item.amount > 0 && item.amount / 1000000 >= 1
                              ? (item.amount / 1000000).toFixed(1) + 'M'
                              : item.amount / 100000 >= 1
                              ? (item.amount / 100000).toFixed(0) + 'K'
                              : item.amount}
                          </span>
                        </div>
                      </div>
                      <div className="bar-label">{item.day}</div>
                    </div>
                  ))}
                </div>
                <div className="chart-stats">
                  <div className="stat">
                    <span className="stat-label">Total Penjualan</span>
                    <span className="stat-value" style={{ color: '#2563eb' }}>
                      Rp {chartData.daily.reduce((sum, d) => sum + d.amount, 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Komisi</span>
                    <span className="stat-value" style={{ color: '#dc2626' }}>
                      Rp {chartData.daily.reduce((sum, d) => sum + d.commission, 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Order</span>
                    <span className="stat-value" style={{ color: '#16a34a' }}>
                      {chartData.daily.reduce((sum, d) => sum + d.orders, 0)} order
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Rata-rata/Hari</span>
                    <span className="stat-value" style={{ color: '#7c3aed' }}>
                      Rp {Math.round(chartData.daily.reduce((sum, d) => sum + d.amount, 0) / (chartData.daily.length || 1)).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-chart">Tidak ada data untuk periode ini</div>
            )}
          </div>
        </div>
      )}

      {/* Marketplace Breakdown Chart */}
      {selectedChart === 'marketplace' && (
        <div className="chart-container">
          <h3>Penjualan per Channel Marketplace</h3>
          <div className="pie-chart">
            {chartData.marketplace.length > 0 ? (
              <div className="marketplace-bars">
                {chartData.marketplace.map((item) => {
                  const source = MARKETPLACE_SOURCES.find(s => s.code === item.name.toLowerCase());
                  const percentage = ((item.amount / maxMarketplaceAmount) * 100).toFixed(1);
                  return (
                    <div key={item.name} className="marketplace-bar">
                      <div className="bar-info">
                        <div className="marketplace-header">
                          <span style={{ fontSize: '1.5em' }}>{item.icon}</span>
                          <span className="marketplace-name">{item.name}</span>
                        </div>
                        <div className="bar-details">
                          <div className="detail-item">
                            <span className="detail-label">Penjualan:</span>
                            <span className="detail-value">Rp {item.amount.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Order:</span>
                            <span className="detail-value">{item.orders}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Komisi:</span>
                            <span className="detail-value">Rp {item.commission.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bar-visual" style={{ width: `${percentage}%` }} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-chart">Tidak ada data untuk periode ini</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeCharts;
