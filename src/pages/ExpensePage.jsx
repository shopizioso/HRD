import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import {
  getExpenseEntries,
  deleteExpenseEntry,
  EXPENSE_CATEGORIES,
} from '../utils/expenseAPI';
import AppButton from '../components/AppButton';
import ExpenseInputForm from '../components/ExpenseInputForm';
import '../styles/IncomePage-Minimalist.css'; // Reuse income page styling

const ExpensePage = () => {
  const { addToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterCategory, setFilterCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  const loadEntries = async () => {
    const allEntries = await getExpenseEntries();
    const filtered = allEntries.filter(entry => {
      const entryMonth = entry.date.slice(0, 7);
      const matchMonth = entryMonth === filterMonth;
      const matchCategory = filterCategory === 'all' || entry.category === filterCategory;
      return matchMonth && matchCategory;
    });
    setEntries(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  useEffect(() => {
    loadEntries();
  }, [filterMonth, filterCategory]);

  const handleDelete = (id) => {
    if (window.confirm('Hapus pengeluaran ini?')) {
      deleteExpenseEntry(id);
      addToast('Pengeluaran dihapus', 'success');
      loadEntries();
    }
  };

  const handleExport = () => {
    try {
      const [year, month] = filterMonth.split('-');
      let csv = 'Tanggal,Kategori,Deskripsi,Jumlah,Catatan\n';
      
      entries.forEach(e => {
        const date = new Date(e.date).toLocaleDateString('id-ID');
        const categoryName = EXPENSE_CATEGORIES.find(c => c.code === e.category)?.name || e.category;
        csv += `"${date}","${categoryName}","${e.description}","Rp ${e.amount.toLocaleString('id-ID')}","${e.notes || ''}"\n`;
      });

      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
      element.setAttribute('download', `pengeluaran-${filterMonth}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      addToast('Data berhasil diexport', 'success');
    } catch (error) {
      console.error('Export error:', error);
      addToast('Gagal mengexport data', 'error');
    }
  };

  const stats = {
    totalAmount: entries.reduce((sum, e) => sum + e.amount, 0),
    totalEntries: entries.length,
    byCategory: {}
  };

  EXPENSE_CATEGORIES.forEach(cat => {
    const categoryEntries = entries.filter(e => e.category === cat.code);
    if (categoryEntries.length > 0) {
      stats.byCategory[cat.code] = {
        amount: categoryEntries.reduce((sum, e) => sum + e.amount, 0),
        count: categoryEntries.length,
        ...cat
      };
    }
  });

  return (
    <div className="income-page" style={{ '--header-color': '#EF4444' }}>
      <div className="page-header-income">
        <div className="header-content">
          <h1>💸 Pengeluaran</h1>
          <p>Kelola pengeluaran operasional</p>
        </div>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Tutup' : '+ Tambah'}
        </button>
      </div>

      {showForm && (
        <ExpenseInputForm onSuccess={() => {
          setShowForm(false);
          loadEntries();
        }} />
      )}

      <div className="filter-bar">
        <input 
          type="month" 
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="filter-input"
        />
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">Semua Kategori</option>
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat.code} value={cat.code}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        <button className="export-btn" onClick={handleExport}>
          📥 Export
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <div className="stat-label">Total Pengeluaran</div>
            <div className="stat-value">Rp {stats.totalAmount.toLocaleString('id-ID')}</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">Jumlah Transaksi</div>
            <div className="stat-value">{stats.totalEntries}</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Rata-rata</div>
            <div className="stat-value">
              Rp {(stats.totalAmount / (stats.totalEntries || 1)).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🏷️</div>
          <div className="stat-content">
            <div className="stat-label">Kategori Aktif</div>
            <div className="stat-value">{Object.keys(stats.byCategory).length}</div>
          </div>
        </div>
      </div>

      <div className="tab-bar">
        <button 
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Daftar ({entries.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'category' ? 'active' : ''}`}
          onClick={() => setActiveTab('category')}
        >
          🏷️ Per Kategori
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="tab-content">
          {entries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>Tidak ada pengeluaran untuk periode ini</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Kategori</th>
                  <th>Deskripsi</th>
                  <th>Jumlah</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.date).toLocaleDateString('id-ID')}</td>
                    <td>
                      {EXPENSE_CATEGORIES.find(c => c.code === entry.category)?.icon} 
                      {EXPENSE_CATEGORIES.find(c => c.code === entry.category)?.name}
                    </td>
                    <td>{entry.description}</td>
                    <td>Rp {entry.amount.toLocaleString('id-ID')}</td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(entry.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'category' && (
        <div className="tab-content">
          {Object.keys(stats.byCategory).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>Tidak ada data kategori</p>
            </div>
          ) : (
            <div className="breakdown-grid">
              {Object.values(stats.byCategory).map(cat => (
                <div key={cat.code} className="breakdown-card">
                  <div className="card-header">
                    <div className="card-title">
                      {cat.icon} {cat.name}
                    </div>
                    <div className="card-badge">
                      {cat.count} transaksi
                    </div>
                  </div>
                  <div className="card-amount">
                    Rp {cat.amount.toLocaleString('id-ID')}
                  </div>
                  <div className="card-percent">
                    {((cat.amount / stats.totalAmount) * 100).toFixed(1)}% dari total
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill" 
                      style={{ 
                        width: `${(cat.amount / stats.totalAmount) * 100}%`,
                        backgroundColor: cat.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpensePage;
