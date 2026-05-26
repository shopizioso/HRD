import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { getProfitLossData } from '../../utils/setupSync';
import AppButton from '../../components/AppButton';
import '../../styles/accounting/ProfitLossPage.css';

const ProfitLossPage = () => {
  const { addToast } = useToast();
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [filterMarketplace, setFilterMarketplace] = useState('all');
  const [profitLossData, setProfitLossData] = useState(getProfitLossData());

  // Update data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setProfitLossData(getProfitLossData());
    };
    
    const interval = setInterval(handleStorageChange, 1000);
    return () => clearInterval(interval);
  }, []);

  const { incomeData, expenseData } = profitLossData;

  const totalIncome = Object.values(incomeData).reduce((a, b) => a + b, 0);
  const totalExpense = Object.values(expenseData).reduce((a, b) => a + b, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(2);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const exportReport = (format) => {
    try {
      let content = '';

      if (format === 'csv') {
        content = 'Laporan Laba Rugi PT Global Digital Zone\n';
        content += `Periode: ${new Date(monthYear + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}\n\n`;
        content += 'PENDAPATAN,Amount\n';
        Object.entries(incomeData).forEach(([key, value]) => {
          content += `"${key}","${value}"\n`;
        });
        content += `\n"Total Pendapatan","${totalIncome}"\n\n`;
        content += 'PENGELUARAN,Amount\n';
        Object.entries(expenseData).forEach(([key, value]) => {
          content += `"${key}","${value}"\n`;
        });
        content += `\n"Total Pengeluaran","${totalExpense}"\n`;
        content += `"LABA BERSIH","${netProfit}"\n`;
        downloadFile(content, `profit-loss-${monthYear}.csv`, 'text/csv');
      } else if (format === 'json') {
        const report = {
          title: 'Laporan Laba Rugi',
          period: monthYear,
          income: incomeData,
          expense: expenseData,
          totalIncome,
          totalExpense,
          netProfit,
          profitMargin,
        };
        downloadFile(JSON.stringify(report, null, 2), `profit-loss-${monthYear}.json`, 'application/json');
      }

      addToast(`Laporan diexport sebagai ${format.toUpperCase()}`, 'success');
    } catch (err) {
      addToast('Gagal export laporan', 'error');
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="pl-report">
      <div className="pl-header">
        <div>
          <h1>📈 Laporan Laba Rugi</h1>
          <p>Income & Expense Analysis</p>
        </div>
        <div className="header-controls">
          <input
            type="month"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            className="date-input"
          />
          <AppButton
            onClick={() => exportReport('csv')}
            variant="secondary"
            style={{ fontSize: '0.9em', padding: '8px 12px' }}
          >
            📥 Export CSV
          </AppButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="pl-summary">
        <div className="summary-card income-card">
          <div className="card-label">Total Pendapatan</div>
          <div className="card-value">{formatCurrency(totalIncome)}</div>
          <div className="card-meta">100% dari total</div>
        </div>

        <div className="summary-card expense-card">
          <div className="card-label">Total Pengeluaran</div>
          <div className="card-value">{formatCurrency(totalExpense)}</div>
          <div className="card-meta">{((totalExpense / totalIncome) * 100).toFixed(1)}% dari pendapatan</div>
        </div>

        <div className="summary-card profit-card">
          <div className="card-label">Laba Bersih</div>
          <div className="card-value">{formatCurrency(netProfit)}</div>
          <div className="card-meta">Profit Margin: {profitMargin}%</div>
        </div>
      </div>

      {/* Income Section */}
      <div className="pl-section">
        <h2 className="section-title">📥 PENDAPATAN</h2>
        <div className="pl-table">
          <div className="pl-row header">
            <div className="col-name">Sumber Pendapatan</div>
            <div className="col-amount">Amount</div>
            <div className="col-percent">% of Total</div>
          </div>

          {Object.entries(incomeData).map(([source, amount]) => (
            <div key={source} className="pl-row data">
              <div className="col-name">📦 {source.charAt(0).toUpperCase() + source.slice(1)}</div>
              <div className="col-amount">{formatCurrency(amount)}</div>
              <div className="col-percent">{((amount / totalIncome) * 100).toFixed(1)}%</div>
            </div>
          ))}

          <div className="pl-row total">
            <div className="col-name">Total Pendapatan</div>
            <div className="col-amount">{formatCurrency(totalIncome)}</div>
            <div className="col-percent">100%</div>
          </div>
        </div>
      </div>

      {/* Expense Section */}
      <div className="pl-section">
        <h2 className="section-title">📤 PENGELUARAN</h2>
        <div className="pl-table">
          <div className="pl-row header">
            <div className="col-name">Kategori Pengeluaran</div>
            <div className="col-amount">Amount</div>
            <div className="col-percent">% of Income</div>
          </div>

          {Object.entries(expenseData).map(([category, amount]) => (
            <div key={category} className="pl-row data">
              <div className="col-name">
                {category === 'salaries' && '👤 Beban Gaji'}
                {category === 'advertising' && '📢 Iklan'}
                {category === 'marketplaceFee' && '🛒 Fee Marketplace'}
                {category === 'hosting' && '🌐 Hosting'}
                {category === 'tools' && '⚙️ Tools'}
                {category === 'transport' && '🚗 Transport'}
                {category === 'bonus' && '🎁 Bonus'}
                {category === 'operational' && '💼 Operasional'}
              </div>
              <div className="col-amount">{formatCurrency(amount)}</div>
              <div className="col-percent">{((amount / totalIncome) * 100).toFixed(1)}%</div>
            </div>
          ))}

          <div className="pl-row total">
            <div className="col-name">Total Pengeluaran</div>
            <div className="col-amount">{formatCurrency(totalExpense)}</div>
            <div className="col-percent">{((totalExpense / totalIncome) * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Net Profit */}
      <div className="pl-section">
        <div className="pl-netprofit">
          <div className="netprofit-row">
            <span>LABA BERSIH</span>
            <strong>{formatCurrency(netProfit)}</strong>
          </div>
          <div className="netprofit-meta">
            <p>Profit Margin: <strong>{profitMargin}%</strong></p>
            <p>Perbandingan: <strong>{((netProfit / totalIncome) * 100).toFixed(1)}%</strong> dari total pendapatan</p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="pl-insights">
        <h3>💡 Insights</h3>
        <div className="insight-items">
          <div className="insight">
            <span className="insight-icon">✓</span>
            <p>Sumber pendapatan terbesar dari <strong>Shopee</strong> ({((incomeData.shopee / totalIncome) * 100).toFixed(0)}%)</p>
          </div>
          <div className="insight">
            <span className="insight-icon">✓</span>
            <p>Pengeluaran terbesar adalah <strong>Beban Gaji</strong> ({((expenseData.salaries / totalExpense) * 100).toFixed(0)}% dari total pengeluaran)</p>
          </div>
          <div className="insight">
            <span className="insight-icon">✓</span>
            <p>Profit margin yang sehat di <strong>{profitMargin}%</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossPage;
