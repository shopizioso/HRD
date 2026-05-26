import React, { useState } from 'react';
import AppButton from '../AppButton';

const DEFAULT_EXPENSES = [];

const ExpenseSetup = ({ data, onUpdate }) => {
  const [expenses, setExpenses] = useState(data?.expenses || DEFAULT_EXPENSES);
  const [operationalExpenses, setOperationalExpenses] = useState(data?.operationalExpenses || []);
  const [newExpense, setNewExpense] = useState({ name: '', icon: '📝', color: '#666666' });
  const [newOpExpense, setNewOpExpense] = useState({ name: '', amount: '', description: '' });

  const handleAddExpense = () => {
    if (!newExpense.name) {
      alert('Nama kategori harus diisi');
      return;
    }

    const expense = {
      id: Math.max(...expenses.map((e) => e.id), 0) + 1,
      name: newExpense.name,
      icon: newExpense.icon,
      color: newExpense.color,
    };

    setExpenses([...expenses, expense]);
    setNewExpense({ name: '', icon: '📝', color: '#666666' });
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const handleAddOpExpense = () => {
    if (!newOpExpense.name || !newOpExpense.amount) {
      alert('Nama dan jumlah pengeluaran harus diisi');
      return;
    }

    const opExpense = {
      id: Date.now(),
      name: newOpExpense.name,
      amount: parseFloat(newOpExpense.amount),
      description: newOpExpense.description,
    };

    setOperationalExpenses([...operationalExpenses, opExpense]);
    setNewOpExpense({ name: '', amount: '', description: '' });
  };

  const handleDeleteOpExpense = (id) => {
    setOperationalExpenses(operationalExpenses.filter((e) => e.id !== id));
  };

  const handleSave = () => {
    onUpdate({ expenses, operationalExpenses });
  };

  const emojis = ['👤', '📢', '🛒', '🌐', '💻', '🚗', '🎁', '💼', '⚙️', '🔧', '📱', '📦', '🏢', '🎯'];
  const colors = ['#3b82f6', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#f97316', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];

  return (
    <div className="setup-section expense-setup">
      {/* Add New Expense */}
      <div className="setup-card">
        <h3 className="card-title">➕ Tambah Kategori Pengeluaran</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Nama Kategori</label>
            <input
              type="text"
              value={newExpense.name}
              onChange={(e) =>
                setNewExpense((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nama kategori pengeluaran..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Icon</label>
            <div className="emoji-selector">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  className={`emoji-btn ${newExpense.icon === emoji ? 'active' : ''}`}
                  onClick={() => setNewExpense((prev) => ({ ...prev, icon: emoji }))}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Warna</label>
            <div className="color-selector">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`color-btn ${newExpense.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewExpense((prev) => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>
        </div>

        <AppButton
          variant="primary"
          onClick={handleAddExpense}
          style={{ width: '100%', marginTop: '16px' }}
        >
          ➕ Tambah Kategori
        </AppButton>
      </div>

      {/* Expenses List */}
      <div className="setup-card" style={{ marginTop: '24px' }}>
        <h3 className="card-title">📋 Kategori Pengeluaran ({expenses.length})</h3>

        <div className="categories-grid">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="category-card"
              style={{ borderLeftColor: expense.color }}
            >
              <div className="category-header">
                <span className="category-icon">{expense.icon}</span>
                <h4>{expense.name}</h4>
              </div>
              <div className="color-preview" style={{ backgroundColor: expense.color }} />
              <AppButton
                variant="secondary"
                onClick={() => handleDeleteExpense(expense.id)}
                style={{ width: '100%', marginTop: '12px', fontSize: '12px' }}
              >
                🗑️ Hapus
              </AppButton>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Expenses */}
      <div className="setup-card" style={{ marginTop: '24px' }}>
        <h3 className="card-title">💸 Pengeluaran Operasional</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Nama Pengeluaran</label>
            <input
              type="text"
              value={newOpExpense.name}
              onChange={(e) =>
                setNewOpExpense((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Biaya Kantor, Asuransi, dll"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Jumlah</label>
            <input
              type="number"
              value={newOpExpense.amount}
              onChange={(e) =>
                setNewOpExpense((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="0"
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Deskripsi</label>
            <textarea
              value={newOpExpense.description}
              onChange={(e) =>
                setNewOpExpense((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Keterangan pengeluaran (opsional)"
              className="form-input"
              rows="2"
              style={{ resize: 'none' }}
            />
          </div>
        </div>

        <AppButton
          variant="primary"
          onClick={handleAddOpExpense}
          style={{ width: '100%', marginBottom: '20px' }}
        >
          ➕ Tambah Pengeluaran
        </AppButton>

        {operationalExpenses.length > 0 && (
          <div className="operational-expenses-list">
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
              Daftar Pengeluaran ({operationalExpenses.length})
            </h4>
            {operationalExpenses.map((expense) => (
              <div
                key={expense.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '8px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px' }}>
                    {expense.name}
                  </p>
                  {expense.description && (
                    <p style={{ margin: '0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {expense.description}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', marginRight: '16px', marginLeft: '16px' }}>
                  <p style={{ margin: '0', fontWeight: '600', fontSize: '14px', color: 'var(--color-primary)' }}>
                    Rp {expense.amount.toLocaleString('id-ID')}
                  </p>
                </div>
                <AppButton
                  variant="secondary"
                  onClick={() => handleDeleteOpExpense(expense.id)}
                  style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}
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
          ✓ Simpan Kategori
        </AppButton>
      </div>
    </div>
  );
};

export default ExpenseSetup;
