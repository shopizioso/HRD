import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import AppButton from '../components/AppButton';
import { calculateFinancialMetrics } from '../utils/setupSync';
import '../styles/FinancialPage.css';

// Import accounting pages
import ProfitLossPage from './accounting/ProfitLossPage';
import BalanceSheetPage from './accounting/BalanceSheetPage';
import CashFlowPage from './accounting/CashFlowPage';
import GeneralJournalPage from './accounting/GeneralJournalPage';
import MarketplaceSummaryPage from './accounting/MarketplaceSummaryPage';
import IncomeReportPage from './IncomeReportPage';
import ComparisonReportPage from './ComparisonReportPage';
import AdvancedFilteringPage from './AdvancedFilteringPage';
import GoalsPage from './GoalsPage';

const FinancialPage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [activeReport, setActiveReport] = useState('dashboard');
  const [financialSummary, setFinancialSummary] = useState(calculateFinancialMetrics());

  // Update financial summary when component mounts or localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setFinancialSummary(calculateFinancialMetrics());
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also check periodically for localStorage changes
    const interval = setInterval(handleStorageChange, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const profitMargin = ((financialSummary.netProfit / financialSummary.totalIncome) * 100).toFixed(1);
  const incomeGrowth = (((financialSummary.totalIncome - financialSummary.lastMonth.income) / financialSummary.lastMonth.income) * 100).toFixed(1);

  const FINANCIAL_MENU = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', desc: 'Financial Overview' },
    { id: 'income', label: 'Laporan Pendapatan', icon: '📥', desc: 'Income Report' },
    { id: 'comparison', label: 'Perbandingan Bulan', icon: '📊', desc: 'Month Comparison' },
    { id: 'goals', label: 'Target & Goals', icon: '🎯', desc: 'Sales Targets' },
    { id: 'filter', label: 'Filter Lanjutan', icon: '🔍', desc: 'Advanced Filtering' },
    { id: 'profitloss', label: 'Laba Rugi', icon: '📈', desc: 'P&L Report' },
    { id: 'balancesheet', label: 'Neraca', icon: '⚖️', desc: 'Balance Sheet' },
    { id: 'cashflow', label: 'Arus Kas', icon: '💵', desc: 'Cash Flow' },
    { id: 'journal', label: 'Jurnal Umum', icon: '📋', desc: 'General Journal' },
    { id: 'marketplace', label: 'Rekap Marketplace', icon: '🛒', desc: 'Marketplace Summary' },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const renderContent = () => {
    switch (activeReport) {
      case 'income':
        return <IncomeReportPage />;
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
    <div className="financial-dashboard">
      <div className="dashboard-header">
        <h1>💼 Financial Dashboard</h1>
        <p>Real-time financial overview and analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card income">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <p className="metric-label">Total Pendapatan</p>
            <h3>{formatCurrency(financialSummary.totalIncome)}</h3>
            <span className="metric-badge positive">+{incomeGrowth}% vs bulan lalu</span>
          </div>
        </div>

        <div className="metric-card expense">
          <div className="metric-icon">💸</div>
          <div className="metric-content">
            <p className="metric-label">Total Pengeluaran</p>
            <h3>{formatCurrency(financialSummary.totalExpense)}</h3>
            <span className="metric-badge">24.6% dari pendapatan</span>
          </div>
        </div>

        <div className="metric-card profit">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <p className="metric-label">Laba Bersih</p>
            <h3>{formatCurrency(financialSummary.netProfit)}</h3>
            <span className="metric-badge positive">Profit Margin: {profitMargin}%</span>
          </div>
        </div>

        <div className="metric-card cash">
          <div className="metric-icon">🏦</div>
          <div className="metric-content">
            <p className="metric-label">Saldo Kas</p>
            <h3>{formatCurrency(financialSummary.cashBalance)}</h3>
            <span className="metric-badge">✓ Sehat</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Reports</h2>
        <div className="menu-grid">
          {FINANCIAL_MENU.map((item) => (
            item.id !== 'dashboard' && (
              <button
                key={item.id}
                className="menu-card"
                onClick={() => setActiveReport(item.id)}
              >
                <div className="menu-icon">{item.icon}</div>
                <h3>{item.label}</h3>
                <p>{item.desc}</p>
                <span className="menu-arrow">→</span>
              </button>
            )
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        <div className="transaction-list">
          <div className="empty-state">
            <p>💼 Belum ada transaksi</p>
            <span className="empty-hint">Transaksi akan muncul di sini setelah Anda menambahkan data keuangan</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="financial-page">
      {/* Sidebar Navigation */}
      <div className="financial-sidebar">
        <h3 className="sidebar-title">📊 Laporan Keuangan</h3>
        <nav className="financial-nav">
          {FINANCIAL_MENU.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeReport === item.id ? 'active' : ''}`}
              onClick={() => setActiveReport(item.id)}
              title={item.desc}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <AppButton
            variant="secondary"
            style={{ width: '100%', marginBottom: '8px' }}
          >
            📥 Export
          </AppButton>
          <AppButton
            variant="secondary"
            style={{ width: '100%' }}
          >
            🖨️ Print
          </AppButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="financial-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default FinancialPage;
