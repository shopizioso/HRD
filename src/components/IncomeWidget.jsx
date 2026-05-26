import React, { useState, useEffect } from 'react';
import { getIncomeEntries, MARKETPLACE_SOURCES } from '../utils/incomeAPI';
import '../styles/IncomeWidget.css';

export default function IncomeWidget() {
  const [todayIncome, setTodayIncome] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);
  const [weekTrend, setWeekTrend] = useState([]);
  const [topMarketplace, setTopMarketplace] = useState(null);
  const [monthAverage, setMonthAverage] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const entries = await getIncomeEntries();
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().slice(0, 7);

    // Today income
    const todayEntries = entries.filter(e => e.date === today);
    const todayTotal = todayEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    setTodayIncome(todayTotal);

    // Month income
    const monthEntries = entries.filter(e => e.date.startsWith(month));
    const monthTotal = monthEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    setMonthIncome(monthTotal);
    setMonthAverage(monthTotal / 30);

    // 7-day trend
    const sevenDayData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayEntries = entries.filter(e => e.date === dateStr);
      const dayTotal = dayEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
      sevenDayData.push({ date: dateStr, amount: dayTotal });
    }
    setWeekTrend(sevenDayData);

    // Top marketplace today
    const marketplaceMap = {};
    todayEntries.forEach(e => {
      marketplaceMap[e.marketplace] = (marketplaceMap[e.marketplace] || 0) + (e.amount || 0);
    });
    const top = Object.entries(marketplaceMap).sort((a, b) => b[1] - a[1])[0];
    if (top) {
      const source = MARKETPLACE_SOURCES.find(s => s.code === top[0]);
      setTopMarketplace({ ...source, amount: top[1] });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const maxAmount = Math.max(...weekTrend.map(d => d.amount), 1);

  return (
    <div className="income-widget">
      <div className="widget-header">
        <h3>💰 Pendapatan Hari Ini</h3>
        <button className="btn-refresh" onClick={loadData}>🔄</button>
      </div>

      {/* Today & Month Stats */}
      <div className="widget-stats">
        <div className="stat-card today">
          <div className="stat-label">Hari Ini</div>
          <div className="stat-value">{formatCurrency(todayIncome)}</div>
          <div className="stat-subtext">{weekTrend.length > 0 ? ((todayIncome / monthAverage * 100) || 0).toFixed(0) : 0}% dari rata-rata</div>
        </div>

        <div className="stat-card month">
          <div className="stat-label">Bulan Ini</div>
          <div className="stat-value" style={{ fontSize: '1.4em' }}>
            {formatCurrency(monthIncome)}
          </div>
          <div className="stat-subtext">Rata-rata: {formatCurrency(monthAverage)}/hari</div>
        </div>
      </div>

      {/* Top Marketplace */}
      {topMarketplace && (
        <div className="widget-top-marketplace">
          <span className="label">🔝 Top Hari Ini:</span>
          <span className="marketplace-badge" style={{ borderColor: topMarketplace.color, backgroundColor: `${topMarketplace.color}15` }}>
            <span style={{ fontSize: '1.2em' }}>{topMarketplace.icon}</span>
            {topMarketplace.name} - {formatCurrency(topMarketplace.amount)}
          </span>
        </div>
      )}

      {/* 7-Day Mini Chart */}
      <div className="widget-chart">
        <div className="chart-label">📊 7 Hari Terakhir</div>
        <div className="mini-bars">
          {weekTrend.map((day, idx) => (
            <div key={idx} className="mini-bar-wrapper" title={`${day.date}: ${formatCurrency(day.amount)}`}>
              <div
                className="mini-bar"
                style={{
                  height: `${(day.amount / maxAmount) * 60}px`,
                  backgroundColor: idx === weekTrend.length - 1 ? '#10b981' : '#667eea'
                }}
              />
              <div className="mini-bar-label">{day.date.split('-')[2]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action */}
      <button className="btn-quick-add">
        ➕ Tambah Pendapatan
      </button>
    </div>
  );
}
