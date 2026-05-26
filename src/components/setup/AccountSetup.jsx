import React, { useState } from 'react';
import AppInput from '../AppInput';
import AppButton from '../AppButton';

const DEFAULT_ACCOUNTS = [];

const AccountSetup = ({ data, onUpdate }) => {
  const [accounts, setAccounts] = useState(data?.accounts || DEFAULT_ACCOUNTS);
  const [editingId, setEditingId] = useState(null);
  const [newAccount, setNewAccount] = useState({
    name: '',
    category: 'ASSET',
    type: 'current',
  });
  const [filterCategory, setFilterCategory] = useState('ALL');

  const generateAccountCode = () => {
    const accountsByCategory = {
      ASSET: accounts.filter((a) => a.category === 'ASSET'),
      LIABILITY: accounts.filter((a) => a.category === 'LIABILITY'),
      EQUITY: accounts.filter((a) => a.category === 'EQUITY'),
      INCOME: accounts.filter((a) => a.category === 'INCOME'),
      EXPENSE: accounts.filter((a) => a.category === 'EXPENSE'),
    };

    const categoryPrefix = {
      ASSET: '1',
      LIABILITY: '2',
      EQUITY: '3',
      INCOME: '4',
      EXPENSE: '5',
    }[newAccount.category];

    const catAccounts = accountsByCategory[newAccount.category];
    const nextNumber = String((catAccounts.length + 1) * 100).padStart(3, '0');
    return categoryPrefix + nextNumber;
  };

  const handleAddAccount = () => {
    if (!newAccount.name) {
      alert('Nama akun harus diisi');
      return;
    }

    const account = {
      id: Math.max(...accounts.map((a) => a.id), 0) + 1,
      code: generateAccountCode(),
      name: newAccount.name,
      category: newAccount.category,
      type: newAccount.type,
    };

    setAccounts([...accounts, account]);
    setNewAccount({ name: '', category: 'ASSET', type: 'current' });
  };

  const handleDeleteAccount = (id) => {
    if (
      window.confirm(
        'Hapus akun ini? Pastikan tidak ada transaksi yang menggunakan akun ini.'
      )
    ) {
      setAccounts(accounts.filter((a) => a.id !== id));
    }
  };

  const handleSave = () => {
    onUpdate({ accounts });
  };

  const filteredAccounts =
    filterCategory === 'ALL'
      ? accounts
      : accounts.filter((a) => a.category === filterCategory);

  const categoryColor = {
    ASSET: '#3b82f6',
    LIABILITY: '#f59e0b',
    EQUITY: '#8b5cf6',
    INCOME: '#10b981',
    EXPENSE: '#ef4444',
  };

  return (
    <div className="setup-section account-setup">
      {/* Add New Account */}
      <div className="setup-card">
        <h3 className="card-title">➕ Tambah Akun Baru</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Nama Akun</label>
            <input
              type="text"
              value={newAccount.name}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nama akun..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select
              value={newAccount.category}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, category: e.target.value }))
              }
              className="form-select"
            >
              <option value="ASSET">Aset</option>
              <option value="LIABILITY">Kewajiban</option>
              <option value="EQUITY">Modal</option>
              <option value="INCOME">Pendapatan</option>
              <option value="EXPENSE">Pengeluaran</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tipe Akun</label>
            <select
              value={newAccount.type}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, type: e.target.value }))
              }
              className="form-select"
            >
              <option value="current">Lancar</option>
              <option value="fixed">Tetap</option>
              <option value="longterm">Jangka Panjang</option>
              <option value="sales">Penjualan</option>
              <option value="payroll">Gaji</option>
              <option value="marketing">Marketing</option>
              <option value="operational">Operasional</option>
              <option value="capital">Modal</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: 'auto' }}>
            <AppButton
              variant="primary"
              onClick={handleAddAccount}
              style={{ width: '100%' }}
            >
              ➕ Tambah Akun
            </AppButton>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="setup-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">📊 Daftar Akun ({filteredAccounts.length})</h3>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterCategory('ALL')}
            >
              Semua
            </button>
            {['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="accounts-table">
          <div className="table-header">
            <div className="col-code">Kode</div>
            <div className="col-name">Nama Akun</div>
            <div className="col-category">Kategori</div>
            <div className="col-type">Tipe</div>
            <div className="col-action">Aksi</div>
          </div>

          {filteredAccounts.map((account) => (
            <div key={account.id} className="table-row">
              <div className="col-code">
                <code>{account.code}</code>
              </div>
              <div className="col-name">{account.name}</div>
              <div className="col-category">
                <span
                  className="category-badge"
                  style={{ borderLeftColor: categoryColor[account.category] }}
                >
                  {account.category}
                </span>
              </div>
              <div className="col-type">{account.type}</div>
              <div className="col-action">
                <AppButton
                  variant="secondary"
                  onClick={() => handleDeleteAccount(account.id)}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  🗑️ Hapus
                </AppButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="setup-actions">
        <AppButton
          variant="primary"
          onClick={handleSave}
          style={{ width: '200px' }}
        >
          ✓ Simpan Akun
        </AppButton>
      </div>
    </div>
  );
};

export default AccountSetup;
