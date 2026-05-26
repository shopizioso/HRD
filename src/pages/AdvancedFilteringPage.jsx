import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getIncomeEntries, MARKETPLACE_SOURCES } from '../utils/incomeAPI';
import {
  createFilter,
  getFilteredEntries,
  getSavedFilters,
  saveFilter,
  deleteFilter,
  getFilterStats,
  exportFilteredAsCSV
} from '../utils/advancedFiltering';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppCard from '../components/AppCard';
import '../styles/AdvancedFiltering.css';

const AdvancedFilteringPage = () => {
  const { addToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState(createFilter('Baru'));
  const [savedFilters, setSavedFilters] = useState([]);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getIncomeEntries();
    setEntries(data);
    setSavedFilters(getSavedFilters());
  };

  const handleFilterChange = (updates) => {
    const newFilter = { ...filter, ...updates };
    setFilter(newFilter);
    applyFilter(newFilter);
  };

  const applyFilter = (filterToApply) => {
    const filtered = getFilteredEntries(entries, filterToApply);
    const filterStats = getFilterStats(entries, filterToApply);
    setResults(filtered);
    setStats(filterStats);
  };

  const handleSaveFilter = () => {
    if (!filter.name || filter.name === 'Baru') {
      addToast('Berikan nama untuk filter ini', 'error');
      return;
    }
    
    saveFilter(filter);
    setSavedFilters(getSavedFilters());
    addToast('Filter berhasil disimpan', 'success');
  };

  const handleDeleteFilter = (id) => {
    if (window.confirm('Hapus filter ini?')) {
      deleteFilter(id);
      setSavedFilters(getSavedFilters());
      addToast('Filter dihapus', 'success');
    }
  };

  const handleLoadFilter = (savedFilter) => {
    setFilter(savedFilter);
    applyFilter(savedFilter);
  };

  const handleExport = () => {
    exportFilteredAsCSV(entries, filter, `filtered-${Date.now()}.csv`);
    addToast('Data berhasil diexport', 'success');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <div className="advanced-filtering">
      <div className="page-header">
        <div>
          <h1>🔍 Filter Lanjutan</h1>
          <p>Cari dan analisis data pendapatan dengan filter kompleks</p>
        </div>
      </div>

      <div className="filter-layout">
        {/* Filter Panel */}
        <div className="filter-panel">
          <AppCard className="filter-section">
            <h3>⚙️ Pengaturan Filter</h3>

            <div className="filter-group">
              <label>Nama Filter</label>
              <input
                type="text"
                value={filter.name}
                onChange={(e) => handleFilterChange({ name: e.target.value })}
                className="filter-input"
                placeholder="Contoh: Sales Shopee Mei"
              />
            </div>

            <div className="filter-group">
              <label>Rentang Tanggal</label>
              <div className="date-range">
                <input
                  type="date"
                  value={filter.dateRange?.start || ''}
                  onChange={(e) => handleFilterChange({
                    dateRange: { ...filter.dateRange, start: e.target.value }
                  })}
                  className="filter-input"
                />
                <span>s/d</span>
                <input
                  type="date"
                  value={filter.dateRange?.end || ''}
                  onChange={(e) => handleFilterChange({
                    dateRange: { ...filter.dateRange, end: e.target.value }
                  })}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Marketplace</label>
              <div className="checkbox-group">
                {MARKETPLACE_SOURCES.map(source => (
                  <label key={source.code} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filter.marketplaces?.includes(source.code) || false}
                      onChange={(e) => {
                        let updated = filter.marketplaces || [];
                        if (e.target.checked) {
                          updated = [...updated, source.code];
                        } else {
                          updated = updated.filter(m => m !== source.code);
                        }
                        handleFilterChange({ marketplaces: updated });
                      }}
                    />
                    {source.icon} {source.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Rentang Penjualan (Rp)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filter.amountRange?.min || 0}
                  onChange={(e) => handleFilterChange({
                    amountRange: { ...filter.amountRange, min: parseFloat(e.target.value) || 0 }
                  })}
                  className="filter-input"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filter.amountRange?.max === Infinity ? '' : (filter.amountRange?.max || '')}
                  onChange={(e) => handleFilterChange({
                    amountRange: { ...filter.amountRange, max: e.target.value ? parseFloat(e.target.value) : Infinity }
                  })}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Minimum Pesanan</label>
              <input
                type="number"
                value={filter.minOrders || 0}
                onChange={(e) => handleFilterChange({ minOrders: parseInt(e.target.value) || 0 })}
                className="filter-input"
                placeholder="0"
              />
            </div>

            <div className="filter-group">
              <label>Cari dalam Catatan</label>
              <input
                type="text"
                value={filter.search || ''}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="filter-input"
                placeholder="Ketik untuk mencari..."
              />
            </div>

            <div className="filter-actions">
              <AppButton
                onClick={handleSaveFilter}
                variant="primary"
                style={{ fontSize: '0.95em', padding: '10px 16px', width: '100%' }}
              >
                💾 Simpan Filter
              </AppButton>
              <AppButton
                onClick={handleExport}
                variant="secondary"
                style={{ fontSize: '0.95em', padding: '10px 16px', width: '100%' }}
              >
                📥 Export Hasil
              </AppButton>
            </div>
          </AppCard>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <AppCard className="saved-filters">
              <h4>💾 Filter Tersimpan</h4>
              <div className="saved-list">
                {savedFilters.map(f => (
                  <div key={f.id} className="saved-item">
                    <button
                      className="saved-btn"
                      onClick={() => handleLoadFilter(f)}
                      title="Load filter"
                    >
                      {f.name}
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteFilter(f.id)}
                      title="Delete filter"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </AppCard>
          )}
        </div>

        {/* Results Panel */}
        <div className="results-panel">
          <AppCard className="results-stats">
            <h3>📊 Statistik Hasil ({stats.totalEntries} data)</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{formatCurrency(stats.totalAmount)}</div>
                <div className="stat-label">Total Penjualan</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalOrders}</div>
                <div className="stat-label">Total Pesanan</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatCurrency(stats.totalCommission)}</div>
                <div className="stat-label">Total Komisi</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatCurrency(stats.avgAmount)}</div>
                <div className="stat-label">Rata-rata</div>
              </div>
            </div>
          </AppCard>

          {/* Results Table */}
          {results.length > 0 ? (
            <AppCard className="results-table">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Marketplace</th>
                    <th style={{ textAlign: 'right' }}>Penjualan</th>
                    <th style={{ textAlign: 'center' }}>Pesanan</th>
                    <th style={{ textAlign: 'right' }}>Komisi</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 50).map((entry, idx) => (
                    <tr key={idx}>
                      <td>{entry.date}</td>
                      <td>{entry.marketplace}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(entry.amount)}</td>
                      <td style={{ textAlign: 'center' }}>{entry.orders || '-'}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(entry.commission)}</td>
                      <td className="note-cell">{entry.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.length > 50 && (
                <div className="results-more">
                  +{results.length - 50} data lainnya (export untuk lihat semua)
                </div>
              )}
            </AppCard>
          ) : (
            <div className="empty-results">
              <div style={{ fontSize: '2em', marginBottom: '12px' }}>🔍</div>
              <p>Tidak ada data yang cocok dengan filter Anda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilteringPage;
