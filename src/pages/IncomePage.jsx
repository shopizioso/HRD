import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import {
  getIncomeEntries,
  deleteIncomeEntry,
  getIncomeSummary,
  exportIncomeAsCSV,
  MARKETPLACE_SOURCES,
} from '../utils/incomeAPI';
import AppButton from '../components/AppButton';
import IncomeInputForm from '../components/IncomeInputForm';
import '../styles/IncomePage.css';

const IncomePage = () => {
  const { addToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterMarketplace, setFilterMarketplace] = useState('all');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [summary, setSummary] = useState(getIncomeSummary());

  const loadEntries = async () => {
    const allEntries = await getIncomeEntries();
    const filtered = allEntries.filter(entry => {
      const entryMonth = entry.date.slice(0, 7);
      const matchMonth = entryMonth === filterMonth;
      const matchMarketplace = filterMarketplace === 'all' || entry.marketplace === filterMarketplace;
      return matchMonth && matchMarketplace;
    });
    setEntries(filtered);
    setSummary(await getIncomeSummary());
  };

  useEffect(() => {
    loadEntries();
  }, [filterMonth, filterMarketplace]);

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      deleteIncomeEntry(id);
      addToast('Data berhasil dihapus', 'success');
      loadEntries();
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEntry(null);
    loadEntries();
  };

  const handleExport = () => {
    try {
      const [year, month] = filterMonth.split('-');
      const startDate = filterMonth + '-01';
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      
      const csv = exportIncomeAsCSV(startDate, endDate);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pendapatan-${filterMonth}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Data berhasil diexport', 'success');
    } catch (error) {
      addToast('Gagal export data: ' + error.message, 'error');
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

  return (
    <div className="income-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>💰 Pendapatan Harian</h1>
          <p>Kelola penjualan dari berbagai channel marketplace</p>
        </div>
        <div className="header-actions">
          <AppButton
            onClick={() => {
              setEditingEntry(null);
              setShowForm(!showForm);
            }}
            variant={showForm ? 'secondary' : 'primary'}
            style={{ fontSize: '0.95em', padding: '10px 16px' }}
          >
            {showForm ? '× Tutup' : '+ Tambah Pendapatan'}
          </AppButton>
        </div>
      </div>

      {/* Input Form */}
      {showForm && (
        <div className="form-section">
          <IncomeInputForm
            editingEntry={editingEntry}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Bulan</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Channel</label>
          <select
            value={filterMarketplace}
            onChange={(e) => setFilterMarketplace(e.target.value)}
            className="filter-input"
          >
            <option value="all">Semua Channel</option>
            {MARKETPLACE_SOURCES.map(source => (
              <option key={source.code} value={source.code}>
                {source.icon} {source.name}
              </option>
            ))}
          </select>
        </div>

        <AppButton
          onClick={handleExport}
          variant="secondary"
          style={{ fontSize: '0.9em', padding: '8px 12px' }}
        >
          📥 Export CSV
        </AppButton>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Total Penjualan</div>
          <div className="summary-value" style={{ color: '#2563eb' }}>
            {formatCurrency(totalAmount)}
          </div>
          <div className="summary-subtext">{entries.length} transaksi</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Total Pesanan</div>
          <div className="summary-value" style={{ color: '#16a34a' }}>
            {totalOrders.toLocaleString('id-ID')} order
          </div>
          <div className="summary-subtext">Rata-rata: {totalOrders > 0 ? Math.round(totalOrders / entries.length || 0) : 0}/transaksi</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Total Komisi</div>
          <div className="summary-value" style={{ color: '#dc2626' }}>
            {formatCurrency(totalCommission)}
          </div>
          <div className="summary-subtext">{((totalCommission / totalAmount * 100) || 0).toFixed(1)}% dari penjualan</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Pendapatan Bersih</div>
          <div className="summary-value" style={{ color: '#7c3aed' }}>
            {formatCurrency(totalAmount - totalCommission)}
          </div>
          <div className="summary-subtext">Setelah komisi</div>
        </div>
      </div>

      {/* Marketplace Summary */}
      <div className="marketplace-breakdown">
        <h2>📊 Ringkasan per Channel</h2>
        <div className="breakdown-grid">
          {summary.summary && Object.entries(summary.summary).map(([code, data]) => {
            if (data.total === 0) return null;
            const source = MARKETPLACE_SOURCES.find(s => s.code === code);
            return (
              <div key={code} className="breakdown-card" style={{ borderColor: source?.color }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.8em' }}>{source?.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{source?.name}</div>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>{data.count} transaksi</div>
                  </div>
                </div>
                <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: source?.color, marginBottom: '4px' }}>
                  {formatCurrency(data.total)}
                </div>
                <div style={{ fontSize: '0.85em', color: '#666' }}>
                  {data.orders} pesanan • {((data.total / summary.totalIncome * 100) || 0).toFixed(1)}% dari total
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Entries Table */}
      <div className="entries-section">
        <h2>📋 Riwayat Transaksi</h2>
        {entries.length > 0 ? (
          <div className="table-responsive">
            <table className="entries-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Channel</th>
                  <th>Penjualan</th>
                  <th>Pesanan</th>
                  <th>Komisi</th>
                  <th>Bersih</th>
                  <th>Catatan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const source = MARKETPLACE_SOURCES.find(s => s.code === entry.marketplace);
                  const date = new Date(entry.date).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  return (
                    <tr key={entry.id} className="entry-row">
                      <td>{date}</td>
                      <td>
                        <span style={{ fontSize: '1.2em', marginRight: '4px' }}>{source?.icon}</span>
                        {source?.name}
                      </td>
                      <td style={{ color: '#2563eb', fontWeight: 500 }}>
                        {formatCurrency(entry.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>{entry.orders || '-'}</td>
                      <td style={{ color: '#dc2626' }}>
                        {formatCurrency(entry.commission)}
                      </td>
                      <td style={{ color: '#7c3aed', fontWeight: 500 }}>
                        {formatCurrency((entry.amount || 0) - (entry.commission || 0))}
                      </td>
                      <td style={{ fontSize: '0.9em', color: '#666', maxWidth: '200px' }}>
                        {entry.note ? entry.note.substring(0, 30) + (entry.note.length > 30 ? '...' : '') : '-'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-small btn-edit"
                            onClick={() => handleEdit(entry)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-small btn-delete"
                            onClick={() => handleDelete(entry.id)}
                            title="Hapus"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '3em', marginBottom: '12px' }}>📭</div>
            <h3>Tidak ada data</h3>
            <p>Belum ada data pendapatan untuk periode ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomePage;
