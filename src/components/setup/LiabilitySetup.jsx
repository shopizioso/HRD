import React, { useState } from 'react';
import AppButton from '../AppButton';

const LIABILITY_TYPES = ['Hutang Usaha', 'Hutang Gaji', 'Hutang Pajak', 'Cicilan', 'Pinjaman', 'Kewajiban Lainnya'];
const LIABILITY_STATUSES = ['Belum Jatuh Tempo', 'Sudah Jatuh Tempo', 'Lunas'];

const LiabilitySetup = ({ data, onUpdate }) => {
  const [liabilities, setLiabilities] = useState(data?.liabilities || []);
  const [newLiability, setNewLiability] = useState({
    name: '',
    type: 'Hutang Usaha',
    amount: '',
    dueDate: '',
    status: 'Belum Jatuh Tempo',
  });

  const handleAddLiability = () => {
    if (!newLiability.name || !newLiability.amount) {
      alert('Nama dan jumlah kewajiban harus diisi');
      return;
    }

    const liability = {
      id: Date.now(),
      ...newLiability,
      amount: parseFloat(newLiability.amount),
    };

    setLiabilities([...liabilities, liability]);
    setNewLiability({
      name: '',
      type: 'Hutang Usaha',
      amount: '',
      dueDate: '',
      status: 'Belum Jatuh Tempo',
    });
  };

  const handleDeleteLiability = (id) => {
    setLiabilities(liabilities.filter((l) => l.id !== id));
  };

  const handleSave = () => {
    onUpdate({ liabilities });
  };

  const totalLiability = liabilities.reduce((sum, l) => sum + l.amount, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const typeColors = {
    'Hutang Usaha': '#3b82f6',
    'Hutang Gaji': '#ef4444',
    'Hutang Pajak': '#f59e0b',
    'Cicilan': '#06b6d4',
    'Pinjaman': '#8b5cf6',
    'Kewajiban Lainnya': '#6366f1',
  };

  const statusColors = {
    'Belum Jatuh Tempo': '#10b981',
    'Sudah Jatuh Tempo': '#f59e0b',
    'Lunas': '#059669',
  };

  return (
    <div className="setup-section liability-setup">
      {/* Add New Liability */}
      <div className="setup-card">
        <h3 className="card-title">➕ Tambah Kewajiban Baru</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Nama Kewajiban</label>
            <input
              type="text"
              value={newLiability.name}
              onChange={(e) =>
                setNewLiability((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Hutang PT Supplier A"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Jenis Kewajiban</label>
            <select
              value={newLiability.type}
              onChange={(e) =>
                setNewLiability((prev) => ({ ...prev, type: e.target.value }))
              }
              className="form-select"
            >
              {LIABILITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Jumlah</label>
            <input
              type="number"
              value={newLiability.amount}
              onChange={(e) =>
                setNewLiability((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Jatuh Tempo</label>
            <input
              type="date"
              value={newLiability.dueDate}
              onChange={(e) =>
                setNewLiability((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={newLiability.status}
              onChange={(e) =>
                setNewLiability((prev) => ({ ...prev, status: e.target.value }))
              }
              className="form-select"
            >
              {LIABILITY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AppButton
          variant="primary"
          onClick={handleAddLiability}
          style={{ width: '100%', marginTop: '16px' }}
        >
          ➕ Tambah Kewajiban
        </AppButton>
      </div>

      {/* Liabilities List */}
      <div className="setup-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">📋 Daftar Kewajiban ({liabilities.length})</h3>
          <div className="balance-summary">
            <span className="balance-label">Total Kewajiban:</span>
            <span className="balance-amount">{formatCurrency(totalLiability)}</span>
          </div>
        </div>

        {liabilities.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada kewajiban yang ditambahkan</p>
          </div>
        ) : (
          <div className="liabilities-table">
            {liabilities.map((liability) => (
              <div key={liability.id} className="liability-row">
                <div className="row-content">
                  <div className="row-header">
                    <span
                      className="type-badge"
                      style={{ backgroundColor: typeColors[liability.type] }}
                    >
                      {liability.type}
                    </span>
                    <h4>{liability.name}</h4>
                  </div>

                  <div className="row-details">
                    <div className="detail">
                      <span className="label">Jumlah:</span>
                      <span className="value">{formatCurrency(liability.amount)}</span>
                    </div>
                    {liability.dueDate && (
                      <div className="detail">
                        <span className="label">Jatuh Tempo:</span>
                        <span className="value">{formatDate(liability.dueDate)}</span>
                      </div>
                    )}
                    <div className="detail">
                      <span className="label">Status:</span>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: statusColors[liability.status] }}
                      >
                        {liability.status}
                      </span>
                    </div>
                  </div>
                </div>

                <AppButton
                  variant="secondary"
                  onClick={() => handleDeleteLiability(liability.id)}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  🗑️ Hapus
                </AppButton>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="setup-actions">
        <AppButton
          variant="primary"
          onClick={handleSave}
          style={{ width: '200px' }}
        >
          ✓ Simpan Kewajiban
        </AppButton>
      </div>
    </div>
  );
};

export default LiabilitySetup;
