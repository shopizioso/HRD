import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { getMarketplaceData } from '../../utils/setupSync';
import AppButton from '../../components/AppButton';
import '../../styles/accounting/MarketplaceSummaryPage.css';

const MarketplaceSummaryPage = () => {
  const { addToast } = useToast();
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [marketplaceData, setMarketplaceData] = useState(getMarketplaceData());

  // Update data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setMarketplaceData(getMarketplaceData());
    };
    
    const interval = setInterval(handleStorageChange, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = selectedMarketplace === 'all' 
    ? Object.values(marketplaceData)
    : [marketplaceData[selectedMarketplace]];

  const totalSales = filteredData.reduce((sum, m) => sum + m.totalSales, 0);
  const totalOrders = filteredData.reduce((sum, m) => sum + m.totalOrders, 0);
  const totalCommission = filteredData.reduce((sum, m) => sum + m.commission, 0);
  const totalRefunds = filteredData.reduce((sum, m) => sum + m.refunds, 0);
  const totalNetIncome = filteredData.reduce((sum, m) => sum + m.netIncome, 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

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
        let content = 'Rekap Marketplace PT Global Digital Zone\n';
        content += `Periode: ${new Date(monthYear + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}\n\n`;
        content += 'Marketplace,Penjualan,Pesanan,Komisi,Refund,Pendapatan Bersih,AOV\n';
        
        filteredData.forEach(m => {
          content += `"${m.name}","${m.totalSales}","${m.totalOrders}","${m.commission}","${m.refunds}","${m.netIncome}","${avgOrderValue}"\n`;
        });
        
        content += `\n"TOTAL","${totalSales}","${totalOrders}","${totalCommission}","${totalRefunds}","${totalNetIncome}","${avgOrderValue}"\n`;
        downloadFile(content, `marketplace-summary-${monthYear}.csv`, 'text/csv');
        addToast('Rekap Marketplace diexport sebagai CSV', 'success');
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
    <div className="mp-report">
      <div className="mp-header">
        <div>
          <h1>🛒 Rekap Marketplace (Marketplace Summary)</h1>
          <p>Multi-channel sales analysis</p>
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

      {/* Channel Filter */}
      <div className="mp-filter">
        <button
          className={`filter-btn ${selectedMarketplace === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedMarketplace('all')}
        >
          Semua Channel
        </button>
        {Object.entries(marketplaceData).map(([key, marketplace]) => (
          <button
            key={key}
            className={`filter-btn ${selectedMarketplace === key ? 'active' : ''}`}
            onClick={() => setSelectedMarketplace(key)}
          >
            {marketplace.icon} {marketplace.name}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="mp-summary">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <p className="card-label">Total Penjualan</p>
            <h3>{formatCurrency(totalSales)}</h3>
            <span className="card-meta">Gross Revenue</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <p className="card-label">Total Pesanan</p>
            <h3>{totalOrders}</h3>
            <span className="card-meta">Transactions</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <p className="card-label">Rata-rata Order</p>
            <h3>{formatCurrency(avgOrderValue)}</h3>
            <span className="card-meta">Average Order Value</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📥</div>
          <div className="card-content">
            <p className="card-label">Pendapatan Bersih</p>
            <h3>{formatCurrency(totalNetIncome)}</h3>
            <span className="card-meta">After Fees & Refunds</span>
          </div>
        </div>
      </div>

      {/* Marketplace Details */}
      <div className="mp-details">
        <h2>Rincian Per Marketplace</h2>
        <div className="mp-table">
          <div className="mp-row header">
            <div className="col-marketplace">Marketplace</div>
            <div className="col-sales">Penjualan</div>
            <div className="col-orders">Pesanan</div>
            <div className="col-aov">AOV</div>
            <div className="col-commission">Komisi</div>
            <div className="col-refund">Refund</div>
            <div className="col-net">Bersih</div>
          </div>

          {filteredData.map((marketplace) => {
            const commissionRate = marketplace.commission > 0 
              ? ((marketplace.commission / marketplace.totalSales) * 100).toFixed(1)
              : 0;
            
            return (
              <div key={marketplace.name} className="mp-row data">
                <div className="col-marketplace">
                  <span className="mp-icon">{marketplace.icon}</span>
                  <span>{marketplace.name}</span>
                </div>
                <div className="col-sales">{formatCurrency(marketplace.totalSales)}</div>
                <div className="col-orders">{marketplace.totalOrders}</div>
                <div className="col-aov">{formatCurrency(marketplace.avgOrderValue)}</div>
                <div className="col-commission">
                  {formatCurrency(marketplace.commission)}
                  <span className="rate">({commissionRate}%)</span>
                </div>
                <div className="col-refund">{formatCurrency(marketplace.refunds)}</div>
                <div className="col-net">
                  <strong>{formatCurrency(marketplace.netIncome)}</strong>
                </div>
              </div>
            );
          })}

          <div className="mp-row total">
            <div className="col-marketplace">TOTAL</div>
            <div className="col-sales">{formatCurrency(totalSales)}</div>
            <div className="col-orders">{totalOrders}</div>
            <div className="col-aov">{formatCurrency(avgOrderValue)}</div>
            <div className="col-commission">{formatCurrency(totalCommission)}</div>
            <div className="col-refund">{formatCurrency(totalRefunds)}</div>
            <div className="col-net">
              <strong>{formatCurrency(totalNetIncome)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="mp-products">
        <h2>Produk Terlaris</h2>
        <div className="products-grid">
          {filteredData.map((marketplace) => (
            <div key={marketplace.name} className="product-card">
              <div className="product-header">
                <span className="product-icon">{marketplace.icon}</span>
                <h3>{marketplace.name}</h3>
              </div>
              <div className="product-info">
                <p className="product-name">{marketplace.topProduct}</p>
                <p className="product-orders">{Math.floor(marketplace.totalOrders * 0.15)} orders</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mp-costs">
        <h2>Analisis Biaya</h2>
        <div className="cost-items">
          <div className="cost-item">
            <span className="cost-label">Total Komisi Marketplace</span>
            <span className="cost-amount negative">{formatCurrency(totalCommission)}</span>
            <span className="cost-rate">({((totalCommission / totalSales) * 100).toFixed(1)}% dari penjualan)</span>
          </div>
          <div className="cost-item">
            <span className="cost-label">Total Refund</span>
            <span className="cost-amount negative">{formatCurrency(totalRefunds)}</span>
            <span className="cost-rate">({((totalRefunds / totalSales) * 100).toFixed(2)}% dari penjualan)</span>
          </div>
          <div className="cost-item total">
            <span className="cost-label">Total Biaya</span>
            <span className="cost-amount">{formatCurrency(totalCommission + totalRefunds)}</span>
            <span className="cost-rate">({((totalCommission + totalRefunds) / totalSales * 100).toFixed(1)}% dari penjualan)</span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mp-insights">
        <h3>💡 Insights</h3>
        <div className="insight-items">
          <div className="insight">
            <span className="insight-icon">✓</span>
            <p>Channel terbaik: <strong>Shopee</strong> dengan {((marketplaceData.shopee.totalSales / totalSales) * 100).toFixed(0)}% dari total penjualan</p>
          </div>
          <div className="insight">
            <span className="insight-icon">✓</span>
            <p>Website sendiri memberikan pendapatan bersih tertinggi (tanpa komisi)</p>
          </div>
          <div className="insight">
            <span className="insight-icon">ℹ</span>
            <p>Rata-rata biaya marketplace: {((totalCommission / totalSales) * 100).toFixed(1)}% dari penjualan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceSummaryPage;
