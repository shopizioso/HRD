import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { getProfitLossData } from '../../utils/setupSync';
import AppButton from '../../components/AppButton';
import '../../styles/accounting/CashFlowPage.css';

const CashFlowPage = () => {
  const { addToast } = useToast();
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
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

  // Operating Activities
  const operatingActivities = {
    netIncome: Object.values(incomeData).reduce((a, b) => a + b, 0) - 
               Object.values(expenseData).reduce((a, b) => a + b, 0),
    adjustments: {
      depreciation: 0,
      changeInAR: 0,
      changeInInventory: 0,
      changeInAP: 0,
    },
  };

  // Investing Activities
  const investingActivities = {
    purchaseEquipment: 0,
    purchaseVehicles: 0,
    saleOfAssets: 0,
  };

  // Financing Activities
  const financingActivities = {
    loanRepayment: 0,
    dividendPaid: 0,
    capitalIncrease: 0,
  };

  const operatingCF = 
    operatingActivities.netIncome + 
    Object.values(operatingActivities.adjustments).reduce((a, b) => a + b, 0);
  const investingCF = Object.values(investingActivities).reduce((a, b) => a + b, 0);
  const financingCF = Object.values(financingActivities).reduce((a, b) => a + b, 0);
  const netCashFlow = operatingCF + investingCF + financingCF;
  const beginningCash = 80000000;
  const endingCash = beginningCash + netCashFlow;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const exportReport = (format) => {
    try {
      if (format === 'csv') {
        let content = 'Laporan Arus Kas PT Global Digital Zone\n';
        content += `Periode: ${new Date(monthYear + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}\n\n`;
        content += 'KATEGORI,AMOUNT\n';
        content += `"Aktivitas Operasional","${operatingCF}"\n`;
        content += `"Aktivitas Investasi","${investingCF}"\n`;
        content += `"Aktivitas Pendanaan","${financingCF}"\n`;
        content += `"Net Cash Flow","${netCashFlow}"\n`;
        downloadFile(content, `cash-flow-${monthYear}.csv`, 'text/csv');
        addToast('Laporan Arus Kas diexport sebagai CSV', 'success');
      }
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
    <div className="cf-report">
      <div className="cf-header">
        <div>
          <h1>💵 Laporan Arus Kas (Cash Flow)</h1>
          <p>Cash Movement Analysis</p>
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
      <div className="cf-summary">
        <div className="summary-card positive">
          <div className="card-icon">📥</div>
          <div className="card-content">
            <p className="card-label">Operating Cash Flow</p>
            <h3>{formatCurrency(operatingCF)}</h3>
          </div>
        </div>

        <div className={`summary-card ${investingCF < 0 ? 'negative' : 'positive'}`}>
          <div className="card-icon">📊</div>
          <div className="card-content">
            <p className="card-label">Investing Cash Flow</p>
            <h3>{formatCurrency(investingCF)}</h3>
          </div>
        </div>

        <div className={`summary-card ${financingCF < 0 ? 'negative' : 'positive'}`}>
          <div className="card-icon">🏦</div>
          <div className="card-content">
            <p className="card-label">Financing Cash Flow</p>
            <h3>{formatCurrency(financingCF)}</h3>
          </div>
        </div>

        <div className={`summary-card ${netCashFlow < 0 ? 'negative' : 'positive'}`}>
          <div className="card-icon">💰</div>
          <div className="card-content">
            <p className="card-label">Net Cash Flow</p>
            <h3>{formatCurrency(netCashFlow)}</h3>
          </div>
        </div>
      </div>

      {/* Operating Activities */}
      <div className="cf-section">
        <h2 className="section-title">📥 Aktivitas Operasional</h2>
        <div className="cf-table">
          <div className="cf-row primary">
            <span className="cf-label">Laba Bersih</span>
            <span className="cf-amount">{formatCurrency(operatingActivities.netIncome)}</span>
          </div>

          <div className="cf-subsection">
            <p className="cf-subtitle">Penyesuaian:</p>
            {Object.entries(operatingActivities.adjustments).map(([key, value]) => (
              <div key={key} className="cf-row">
                <span className="cf-label cf-indent">
                  {key === 'depreciation' && '📉 Depresiasi'}
                  {key === 'changeInAR' && '📋 Perubahan Piutang'}
                  {key === 'changeInInventory' && '📦 Perubahan Persediaan'}
                  {key === 'changeInAP' && '📤 Perubahan Hutang'}
                </span>
                <span className={`cf-amount ${value < 0 ? 'negative' : 'positive'}`}>
                  {formatCurrency(value)}
                </span>
              </div>
            ))}
          </div>

          <div className="cf-row total">
            <span className="cf-label">Arus Kas dari Operasional</span>
            <span className="cf-amount">{formatCurrency(operatingCF)}</span>
          </div>
        </div>
      </div>

      {/* Investing Activities */}
      <div className="cf-section">
        <h2 className="section-title">📊 Aktivitas Investasi</h2>
        <div className="cf-table">
          {Object.entries(investingActivities).map(([key, value]) => (
            <div key={key} className="cf-row">
              <span className="cf-label">
                {key === 'purchaseEquipment' && '⚙️ Pembelian Peralatan'}
                {key === 'purchaseVehicles' && '🚗 Pembelian Kendaraan'}
                {key === 'saleOfAssets' && '💳 Penjualan Aset'}
              </span>
              <span className={`cf-amount ${value < 0 ? 'negative' : 'positive'}`}>
                {formatCurrency(value)}
              </span>
            </div>
          ))}

          <div className="cf-row total">
            <span className="cf-label">Arus Kas dari Investasi</span>
            <span className="cf-amount">{formatCurrency(investingCF)}</span>
          </div>
        </div>
      </div>

      {/* Financing Activities */}
      <div className="cf-section">
        <h2 className="section-title">🏦 Aktivitas Pendanaan</h2>
        <div className="cf-table">
          {Object.entries(financingActivities).map(([key, value]) => (
            <div key={key} className="cf-row">
              <span className="cf-label">
                {key === 'loanRepayment' && '💳 Pelunasan Pinjaman'}
                {key === 'dividendPaid' && '📊 Dividen Dibayar'}
                {key === 'capitalIncrease' && '💰 Penambahan Modal'}
              </span>
              <span className={`cf-amount ${value < 0 ? 'negative' : 'positive'}`}>
                {formatCurrency(value)}
              </span>
            </div>
          ))}

          <div className="cf-row total">
            <span className="cf-label">Arus Kas dari Pendanaan</span>
            <span className="cf-amount">{formatCurrency(financingCF)}</span>
          </div>
        </div>
      </div>

      {/* Cash Position */}
      <div className="cf-section">
        <h2 className="section-title">💼 Posisi Kas</h2>
        <div className="cf-table">
          <div className="cf-row">
            <span className="cf-label">Kas Awal Periode</span>
            <span className="cf-amount">{formatCurrency(beginningCash)}</span>
          </div>

          <div className="cf-row highlight">
            <span className="cf-label">Arus Kas Bersih</span>
            <span className={`cf-amount ${netCashFlow < 0 ? 'negative' : 'positive'}`}>
              {formatCurrency(netCashFlow)}
            </span>
          </div>

          <div className="cf-row primary">
            <span className="cf-label">Kas Akhir Periode</span>
            <span className="cf-amount">{formatCurrency(endingCash)}</span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="cf-insights">
        <h3>💡 Cash Flow Analysis</h3>
        <div className="insight-items">
          <div className="insight">
            <span className="insight-status positive">✓</span>
            <p>Operating cash flow <strong>positif</strong> ({formatCurrency(operatingCF)})</p>
          </div>
          <div className="insight">
            <span className="insight-status">ℹ</span>
            <p>Investasi dalam periode ini sebesar {formatCurrency(Math.abs(investingCF))}</p>
          </div>
          <div className="insight">
            <span className="insight-status positive">✓</span>
            <p>Kas akhir periode meningkat menjadi {formatCurrency(endingCash)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowPage;
