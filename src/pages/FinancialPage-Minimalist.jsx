import React, { useState, useEffect } from 'react';
import { calculateFinancialMetrics } from '../utils/setupSync';
import '../styles/FinancialPage-Minimalist.css';

// Import all pages
import ProfitLossPage from './accounting/ProfitLossPage';
import BalanceSheetPage from './accounting/BalanceSheetPage';
import CashFlowPage from './accounting/CashFlowPage';
import GeneralJournalPage from './accounting/GeneralJournalPage';
import MarketplaceSummaryPage from './accounting/MarketplaceSummaryPage';
import IncomeReportPage from './IncomeReportPage';
import ComparisonReportPage from './ComparisonReportPage';
import AdvancedFilteringPage from './AdvancedFilteringPage';
import GoalsPage from './GoalsPage';
import ExpensePage from './ExpensePage';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', category: 'main' },
  { id: 'income', label: 'Pendapatan', category: 'operational' },
  { id: 'expense', label: 'Pengeluaran', category: 'operational' },
  { id: 'goals', label: 'Target', category: 'operational' },
  { id: 'comparison', label: 'Perbandingan', category: 'operational' },
  { id: 'profitloss', label: 'Laba Rugi', category: 'financial' },
  { id: 'balancesheet', label: 'Neraca', category: 'financial' },
  { id: 'cashflow', label: 'Arus Kas', category: 'financial' },
  { id: 'journal', label: 'Jurnal', category: 'analysis' },
  { id: 'marketplace', label: 'Marketplace', category: 'analysis' },
  { id: 'filter', label: 'Filter', category: 'tools' },
];

const FinancialPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [financialSummary, setFinancialSummary] = useState(calculateFinancialMetrics());

  useEffect(() => {
    const handleStorageChange = () => {
      setFinancialSummary(calculateFinancialMetrics());
    };
    
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'income':
        return <IncomeReportPage />;
      case 'expense':
        return <ExpensePage />;
      case 'comparison':
        return <ComparisonReportPage />;
      case 'goals':
        return <GoalsPage />;
      case 'filter':
        return <AdvancedFilteringPage />;
      case 'profitloss':
        return <ProfitLossPage />;
      case 'balancesheet':
        return <BalanceSheetPage />;
      case 'cashflow':
        return <CashFlowPage />;
      case 'journal':
        return <GeneralJournalPage />;
      case 'marketplace':
        return <MarketplaceSummaryPage />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div>
      <div className="dashboard-header">
        <h2>Ringkasan Keuangan</h2>
        <p>Snapshot real-time kesehatan finansial perusahaan Anda</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <p className="metric-label">Pendapatan</p>
            <p className="metric-value">{formatCurrency(financialSummary.totalIncome)}</p>
            <p className="metric-badge positive">+12% vs bulan lalu</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💸</div>
          <div className="metric-content">
            <p className="metric-label">Pengeluaran</p>
            <p className="metric-value">{formatCurrency(financialSummary.totalExpense)}</p>
            <p className="metric-badge">24% dari pendapatan</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <p className="metric-label">Laba Bersih</p>
            <p className="metric-value">{formatCurrency(financialSummary.netProfit)}</p>
            <p className="metric-badge positive">Margin: 76%</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🏦</div>
          <div className="metric-content">
            <p className="metric-label">Saldo Kas</p>
            <p className="metric-value">{formatCurrency(financialSummary.cashBalance)}</p>
            <p className="metric-badge positive">✓ Sehat</p>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '0.95em', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Akses Cepat
        </h3>
        <div className="action-cards">
          <div className="action-card" onClick={() => setActiveTab('income')}>
            <div className="action-icon">📥</div>
            <div className="action-label">Pendapatan</div>
          </div>
          <div className="action-card" onClick={() => setActiveTab('expense')}>
            <div className="action-icon">💸</div>
            <div className="action-label">Pengeluaran</div>
          </div>
          <div className="action-card" onClick={() => setActiveTab('goals')}>
            <div className="action-icon">🎯</div>
            <div className="action-label">Target</div>
          </div>
          <div className="action-card" onClick={() => setActiveTab('profitloss')}>
            <div className="action-icon">📊</div>
            <div className="action-label">P&L</div>
          </div>
          <div className="action-card" onClick={() => setActiveTab('balancesheet')}>
            <div className="action-icon">⚖️</div>
            <div className="action-label">Neraca</div>
          </div>
          <div className="action-card" onClick={() => setActiveTab('cashflow')}>
            <div className="action-icon">💵</div>
            <div className="action-label">Arus Kas</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="financial-page">
      <div className="page-header">
        <h1>💼 Keuangan</h1>
        <p>Manajemen finansial dan pelaporan keuangan</p>
      </div>

      {/* Tab Navigation */}
      <div className="financial-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          📊 Dashboard
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0' }}>
          <button
            className={`tab-btn ${['income', 'goals', 'comparison'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => handleTabChange('income')}
            title="Operasional: Pendapatan, Target, Perbandingan"
          >
            ⚙️ Operasional
          </button>
          <button
            className={`tab-btn ${['profitloss', 'balancesheet', 'cashflow'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => handleTabChange('profitloss')}
            title="Laporan: P&L, Neraca, Arus Kas"
          >
            📋 Laporan
          </button>
          <button
            className={`tab-btn ${['journal', 'marketplace', 'filter'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => handleTabChange('filter')}
            title="Analisis: Jurnal, Marketplace, Filter"
          >
            🔍 Analisis
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="financial-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default FinancialPage;
