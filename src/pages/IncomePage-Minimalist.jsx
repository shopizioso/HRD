import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import {
  getIncomeEntries,
  deleteIncomeEntry,
  updateIncomeEntry,
  MARKETPLACE_SOURCES,
} from '../utils/incomeAPI';
import AppButton from '../components/AppButton';
import IncomeInputForm from '../components/IncomeInputForm';
import '../styles/IncomePage-Minimalist.css';

const IncomePage = () => {
  const { addToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterMarketplace, setFilterMarketplace] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  const loadEntries = async () => {
    const allEntries = await getIncomeEntries();
    const filtered = allEntries.filter(entry => {
      const entryMonth = entry.date.slice(0, 7);
      const matchMonth = entryMonth === filterMonth;
      const matchMarketplace = filterMarketplace === 'all' || entry.marketplace === filterMarketplace;
      return matchMonth && matchMarketplace;
    });
    setEntries(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  useEffect(() => {
    loadEntries();
  }, [filterMonth, filterMarketplace]);

  const handleDelete = (id) => {
    if (window.confirm('Hapus data ini?')) {
      deleteIncomeEntry(id);
      addToast('Data dihapus', 'success');
      loadEntries();
    }
  };

  const handleExport = () => {
    try {
      const [year, month] = filterMonth.split('-');
      let csv = 'Tanggal,Channel,Penjualan,Pesanan,Komisi,Catatan\n';
      
      entries.forEach(e => {
        const date = new Date(e.date).toLocaleDateString('id-ID');
        const note = (e.note || '').replace(/"/g, '""');
        csv += `"${date}","${e.marketplace}","${e.amount || 0}","${e.orders || 0}","${e.commission || 0}","${note}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `pendapatan-${filterMonth}.csv`;
      link.click();
      addToast('Data diexport', 'success');
    } catch (error) {
      addToast('Gagal export: ' + error.message, 'error');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const totalAmount = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalOrders = entries.reduce((sum, e) => sum + (e.orders || 0), 0);
  const totalCommission = entries.reduce((sum, e) => sum + (e.commission || 0), 0);

  const getMarketplaceName = (code) => {
    const source = MARKETPLACE_SOURCES.find(s => s.code === code);
    return source ? `${source.icon} ${source.name}` : code;
  };

  return (
    <div className="income-page">
      {/* Header */}
      <div className="page-header-income">
        <div>
          <h1>💰 Pendapatan</h1>
          <p>Kelola penjualan dari berbagai channel</p>
        </div>
        <AppButton
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
        >
          {showForm ? '✕ Tutup' : '+ Tambah'}
        </AppButton>
      </div>

      {/* Form */}
      {showForm && (
        <div className="form-wrapper">
          <IncomeInputForm onSuccess={() => { setShowForm(false); loadEntries(); }} />
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-item">
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="filter-input-income"
          />
        </div>

        <div className="filter-item">
          <select
            value={filterMarketplace}
            onChange={(e) => setFilterMarketplace(e.target.value)}
            className="filter-input-income"
          >
            <option value="all">Semua Channel</option>
            {MARKETPLACE_SOURCES.map(s => (
              <option key={s.code} value={s.code}>{s.icon} {s.name}</option>
            ))}
          </select>
        </div>

        <AppButton
          onClick={handleExport}
          variant="secondary"
          style={{ fontSize: '0.9em' }}
        >
          📥 Export
        </AppButton>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <div className="stat-label">Penjualan</div>
            <div className="stat-value">{formatCurrency(totalAmount)}</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-label">Pesanan</div>
            <div className="stat-value">{totalOrders.toLocaleString('id-ID')}</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <div className="stat-label">Komisi</div>
            <div className="stat-value">{formatCurrency(totalCommission)}</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <div className="stat-label">Bersih</div>
            <div className="stat-value">{formatCurrency(totalAmount - totalCommission)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button 
          className={`tab-item ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Daftar ({entries.length})
        </button>
        <button 
          className={`tab-item ${activeTab === 'breakdown' ? 'active' : ''}`}
          onClick={() => setActiveTab('breakdown')}
        >
          📊 Per Channel
        </button>
      </div>

      {/* Content */}
      {activeTab === 'list' ? (
        <div className="content-section">
          {entries.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Channel</th>
                    <th style={{ textAlign: 'right' }}>Penjualan</th>
                    <th style={{ textAlign: 'center' }}>Order</th>
                    <th style={{ textAlign: 'right' }}>Komisi</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id}>
                      <td>{new Date(e.date).toLocaleDateString('id-ID')}</td>
                      <td>{getMarketplaceName(e.marketplace)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(e.amount)}</td>
                      <td style={{ textAlign: 'center' }}>{e.orders || '-'}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(e.commission)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(e.id)}
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state-income">
              <div style={{ fontSize: '3em', marginBottom: '8px' }}>📭</div>
              <p>Tidak ada data untuk periode ini</p>
            </div>
          )}
        </div>
      ) : (
        <div className="content-section">
          <div className="breakdown-cards">
            {MARKETPLACE_SOURCES.map(source => {
              const channelEntries = entries.filter(e => e.marketplace === source.code);
              const channelAmount = channelEntries.reduce((s, e) => s + (e.amount || 0), 0);
              const channelOrders = channelEntries.reduce((s, e) => s + (e.orders || 0), 0);
              const percentage = ((channelAmount / totalAmount) * 100 || 0).toFixed(1);

              if (channelAmount === 0) return null;

              return (
                <div key={source.code} className="breakdown-card">
                  <div className="breakdown-header">
                    <span className="breakdown-title">{source.icon} {source.name}</span>
                    <span className="breakdown-percent">{percentage}%</span>
                  </div>
                  <div className="breakdown-bar">
                    <div className="breakdown-fill" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="breakdown-stats">
                    <div>{formatCurrency(channelAmount)}</div>
                    <div>{channelOrders} order</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomePage;
