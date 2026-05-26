import React, { useState, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import IncomeWidget from '../components/IncomeWidget';
import {
  SalaryDistributionChart,
  PayrollTrendChart,
} from '../components/DashboardCharts';
import '../styles/DashboardPage-Minimalist.css';

export default function DashboardPage() {
  const [dateStr] = useState(new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  const stats = [
    { title: 'Karyawan Aktif', value: '0', helper: 'Tambah data karyawan' },
    { title: 'Penggajian Bulan Ini', value: 'Rp 0', helper: 'Tambahkan slip penggajian' },
    { title: 'Pendapatan Bulan Ini', value: 'Rp 0', helper: 'Tambahkan transaksi pemasukan' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>{dateStr}</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="stats-row">
        {stats.map((item) => (
          <SummaryCard 
            key={item.title} 
            title={item.title} 
            value={item.value} 
            helper={item.helper} 
          />
        ))}
      </div>

      {/* Income Widget */}
      <IncomeWidget />

      {/* Charts */}
      <div className="charts-row">
        <SalaryDistributionChart />
        <PayrollTrendChart />
      </div>
    </div>
  );
}
