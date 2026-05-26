import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { addExpenseEntry, EXPENSE_CATEGORIES } from '../utils/expenseAPI';
import AppInput from './AppInput';
import AppButton from './AppButton';
import AppCard from './AppCard';
import '../styles/FormInput.css';

export default function ExpenseInputForm({ onSuccess }) {
  const { addToast } = useToast();
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'operasional',
    description: '',
    amount: 0,
    notes: ''
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (field, valueOrEvent) => {
    // Extract value from event if it's an event object
    const value = valueOrEvent && valueOrEvent.target !== undefined 
      ? valueOrEvent.target.value 
      : valueOrEvent;

    const updated = { ...data, [field]: value };
    setData(updated);
    
    // Show preview if amount is > 0 and description exists
    if (updated.amount > 0 && updated.description.trim()) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.description.trim()) {
      addToast('Deskripsi harus diisi', 'error');
      return;
    }

    if (data.amount <= 0) {
      addToast('Jumlah harus lebih besar dari 0', 'error');
      return;
    }

    try {
      await addExpenseEntry(data);
      addToast(`Pengeluaran sebesar Rp ${data.amount.toLocaleString()} ditambahkan`, 'success');
      
      // Reset form
      setData({
        date: new Date().toISOString().split('T')[0],
        category: 'operasional',
        description: '',
        amount: 0,
        notes: ''
      });
      setShowPreview(false);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error adding expense:', error);
      addToast('Gagal menambahkan pengeluaran', 'error');
    }
  };

  const categoryIcon = EXPENSE_CATEGORIES.find(c => c.code === data.category)?.icon;

  return (
    <div className="expense-input-form">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <AppInput
            label="Tanggal"
            type="date"
            value={data.date}
            onChange={(value) => handleChange('date', value)}
          />

          <div className="form-group">
            <label>Kategori</label>
            <select
              value={data.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="form-select"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.code} value={cat.code}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <AppInput
            label="Deskripsi"
            type="text"
            placeholder="Cth: Gaji Mei, Iklan Shopee, etc"
            value={data.description}
            onChange={(value) => handleChange('description', value)}
          />

          <AppInput
            label="Jumlah (Rp)"
            type="number"
            placeholder="0"
            value={data.amount}
            onChange={(e) => {
              const val = e && e.target !== undefined ? e.target.value : e;
              handleChange('amount', val ? parseInt(val) : 0);
            }}
          />

          <AppInput
            label="Catatan"
            type="text"
            placeholder="Opsional"
            value={data.notes}
            onChange={(value) => handleChange('notes', value)}
          />
        </div>

        {showPreview && (
          <AppCard className="preview-card">
            <div className="preview-content">
              <div className="preview-item">
                <span className="preview-label">Kategori</span>
                <span className="preview-value">
                  {EXPENSE_CATEGORIES.find(c => c.code === data.category)?.icon} 
                  {EXPENSE_CATEGORIES.find(c => c.code === data.category)?.name}
                </span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Deskripsi</span>
                <span className="preview-value">{data.description}</span>
              </div>
              <div className="preview-item highlight">
                <span className="preview-label">Jumlah</span>
                <span className="preview-value">Rp {data.amount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </AppCard>
        )}

        <div className="form-actions">
          <AppButton type="submit" variant="primary">
            💾 Simpan Pengeluaran
          </AppButton>
        </div>
      </form>
    </div>
  );
}
