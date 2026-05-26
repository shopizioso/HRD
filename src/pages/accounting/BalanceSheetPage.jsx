import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { getBalanceSheetData } from '../../utils/setupSync';
import AppButton from '../../components/AppButton';
import '../../styles/accounting/BalanceSheetPage.css';

const BalanceSheetPage = () => {
  const { addToast } = useToast();
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [balanceSheetData, setBalanceSheetData] = useState(getBalanceSheetData());

  // Update data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setBalanceSheetData(getBalanceSheetData());
    };
    
    const interval = setInterval(handleStorageChange, 1000);
    return () => clearInterval(interval);
  }, []);

  const { assets, liabilities, equity } = balanceSheetData;

  const totalCurrentAssets = Object.values(assets.currentAssets).reduce((a, b) => a + b, 0);
  const totalFixedAssets = Object.values(assets.fixedAssets).reduce((a, b) => a + b, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = Object.values(liabilities.currentLiabilities).reduce((a, b) => a + b, 0);
  const totalLongTermLiabilities = Object.values(liabilities.longTermLiabilities).reduce((a, b) => a + b, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = Object.values(equity).reduce((a, b) => a + b, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const currentRatio = (totalCurrentAssets / totalCurrentLiabilities).toFixed(2);
  const debtToEquity = (totalLiabilities / totalEquity).toFixed(2);
  const workingCapital = totalCurrentAssets - totalCurrentLiabilities;

  const exportReport = (format) => {
    try {
      let content = '';

      if (format === 'csv') {
        content = 'Neraca PT Global Digital Zone\n';
        content += `Tanggal: ${new Date(monthYear + '-01').toLocaleDateString('id-ID')}\n\n`;
        content += 'ASET,Amount\n';
        content += 'Aset Lancar\n';
        Object.entries(assets.currentAssets).forEach(([key, value]) => {
          content += `"${key}","${value}"\n`;
        });
        content += `\n"Total Aset Lancar","${totalCurrentAssets}"\n`;
        content += '\nAset Tetap\n';
        Object.entries(assets.fixedAssets).forEach(([key, value]) => {
          content += `"${key}","${value}"\n`;
        });
        content += `\n"Total Aset Tetap","${totalFixedAssets}"\n`;
        content += `"TOTAL ASET","${totalAssets}"\n`;
        downloadFile(content, `balance-sheet-${monthYear}.csv`, 'text/csv');
      }

      addToast(`Neraca diexport sebagai ${format.toUpperCase()}`, 'success');
    } catch (err) {
      addToast('Gagal export neraca', 'error');
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
    <div className="bs-report">
      <div className="bs-header">
        <div>
          <h1>⚖️ Neraca (Balance Sheet)</h1>
          <p>Assets, Liabilities & Equity</p>
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
            📥 Export
          </AppButton>
        </div>
      </div>

      {/* Financial Ratios */}
      <div className="bs-ratios">
        <div className="ratio-card">
          <div className="ratio-label">Current Ratio</div>
          <div className="ratio-value">{currentRatio}</div>
          <div className="ratio-meta">Likuiditas: {parseFloat(currentRatio) > 1 ? '✓ Sehat' : '⚠️ Perhatian'}</div>
        </div>
        <div className="ratio-card">
          <div className="ratio-label">Debt to Equity</div>
          <div className="ratio-value">{debtToEquity}</div>
          <div className="ratio-meta">Leverage: {parseFloat(debtToEquity) < 1 ? '✓ Baik' : '⚠️ Tinggi'}</div>
        </div>
        <div className="ratio-card">
          <div className="ratio-label">Working Capital</div>
          <div className="ratio-value">{formatCurrency(workingCapital)}</div>
          <div className="ratio-meta">Modal Kerja</div>
        </div>
      </div>

      <div className="bs-container">
        {/* Assets Column */}
        <div className="bs-column">
          <h2 className="column-title">📊 ASET (ASSETS)</h2>

          {/* Current Assets */}
          <div className="bs-section">
            <h3 className="section-header">Aset Lancar (Current Assets)</h3>
            <div className="bs-table">
              {Object.entries(assets.currentAssets).map(([key, value]) => (
                <div key={key} className="bs-row">
                  <span className="bs-label">
                    {key === 'cash' && '💵 Kas'}
                    {key === 'bankAccount' && '🏦 Rekening Bank'}
                    {key === 'accountsReceivable' && '📋 Piutang'}
                    {key === 'inventory' && '📦 Persediaan'}
                    {key === 'prepaidExpenses' && '📝 Biaya Dibayar Dimuka'}
                  </span>
                  <span className="bs-amount">{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="bs-row subtotal">
                <span className="bs-label">Total Aset Lancar</span>
                <span className="bs-amount">{formatCurrency(totalCurrentAssets)}</span>
              </div>
            </div>
          </div>

          {/* Fixed Assets */}
          <div className="bs-section">
            <h3 className="section-header">Aset Tetap (Fixed Assets)</h3>
            <div className="bs-table">
              {Object.entries(assets.fixedAssets).map(([key, value]) => (
                <div key={key} className="bs-row">
                  <span className="bs-label">
                    {key === 'equipment' && '⚙️ Peralatan'}
                    {key === 'accumulatedDepreciation' && '📉 Akumulasi Depresiasi'}
                    {key === 'vehicles' && '🚗 Kendaraan'}
                    {key === 'accumulatedDepVehicles' && '📉 Akum. Depresiasi Kendaraan'}
                  </span>
                  <span className={`bs-amount ${value < 0 ? 'negative' : ''}`}>
                    {formatCurrency(value)}
                  </span>
                </div>
              ))}
              <div className="bs-row subtotal">
                <span className="bs-label">Total Aset Tetap</span>
                <span className="bs-amount">{formatCurrency(totalFixedAssets)}</span>
              </div>
            </div>
          </div>

          <div className="bs-row total">
            <span className="bs-label">TOTAL ASET</span>
            <span className="bs-amount">{formatCurrency(totalAssets)}</span>
          </div>
        </div>

        {/* Liabilities & Equity Column */}
        <div className="bs-column">
          <h2 className="column-title">💳 KEWAJIBAN & EKUITAS (LIABILITIES & EQUITY)</h2>

          {/* Current Liabilities */}
          <div className="bs-section">
            <h3 className="section-header">Kewajiban Lancar (Current Liabilities)</h3>
            <div className="bs-table">
              {Object.entries(liabilities.currentLiabilities).map(([key, value]) => (
                <div key={key} className="bs-row">
                  <span className="bs-label">
                    {key === 'accountsPayable' && '📤 Hutang Usaha'}
                    {key === 'shortTermLoans' && '🏦 Pinjaman Jangka Pendek'}
                    {key === 'dueInvoices' && '📋 Invoice Jatuh Tempo'}
                  </span>
                  <span className="bs-amount">{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="bs-row subtotal">
                <span className="bs-label">Total Kewajiban Lancar</span>
                <span className="bs-amount">{formatCurrency(totalCurrentLiabilities)}</span>
              </div>
            </div>
          </div>

          {/* Long Term Liabilities */}
          <div className="bs-section">
            <h3 className="section-header">Kewajiban Jangka Panjang</h3>
            <div className="bs-table">
              {Object.entries(liabilities.longTermLiabilities).map(([key, value]) => (
                <div key={key} className="bs-row">
                  <span className="bs-label">
                    {key === 'longTermLoans' && '🏦 Pinjaman Jangka Panjang'}
                    {key === 'deferredTaxes' && '📊 Pajak Ditangguhkan'}
                  </span>
                  <span className="bs-amount">{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="bs-row subtotal">
                <span className="bs-label">Total Kewajiban Jangka Panjang</span>
                <span className="bs-amount">{formatCurrency(totalLongTermLiabilities)}</span>
              </div>
            </div>
          </div>

          <div className="bs-row total">
            <span className="bs-label">TOTAL KEWAJIBAN</span>
            <span className="bs-amount">{formatCurrency(totalLiabilities)}</span>
          </div>

          {/* Equity */}
          <div className="bs-section">
            <h3 className="section-header">Ekuitas (Equity)</h3>
            <div className="bs-table">
              {Object.entries(equity).map(([key, value]) => (
                <div key={key} className="bs-row">
                  <span className="bs-label">
                    {key === 'capital' && '💰 Modal'}
                    {key === 'retainedEarnings' && '📈 Laba Ditahan'}
                  </span>
                  <span className="bs-amount">{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="bs-row subtotal">
                <span className="bs-label">Total Ekuitas</span>
                <span className="bs-amount">{formatCurrency(totalEquity)}</span>
              </div>
            </div>
          </div>

          <div className="bs-row total">
            <span className="bs-label">TOTAL KEWAJIBAN & EKUITAS</span>
            <span className="bs-amount">{formatCurrency(totalLiabilitiesAndEquity)}</span>
          </div>
        </div>
      </div>

      {/* Balance Check */}
      <div className="bs-check">
        {totalAssets === totalLiabilitiesAndEquity ? (
          <div className="check-valid">✓ Neraca Seimbang</div>
        ) : (
          <div className="check-invalid">
            ⚠️ Neraca Tidak Seimbang (Selisih: {formatCurrency(Math.abs(totalAssets - totalLiabilitiesAndEquity))})
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceSheetPage;
