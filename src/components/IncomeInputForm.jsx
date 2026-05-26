import React, { useState, useEffect } from 'react';
import { MARKETPLACE_SOURCES, addIncomeEntry, updateIncomeEntry } from '../utils/incomeAPI';
import { useToast } from '../context/ToastContext';
import AppButton from './AppButton';
import AppInput from './AppInput';
import AppCard from './AppCard';

export default function IncomeInputForm({ onSuccess, editingEntry = null }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    marketplace: 'shopee',
    amount: '',
    orders: '',
    commission: '',
    note: '',
  });

  useEffect(() => {
    if (editingEntry) {
      setFormData(editingEntry);
    }
  }, [editingEntry]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.date || !formData.marketplace || !formData.amount) {
      addToast('Tanggal, marketplace, dan penjualan harus diisi', 'error');
      return;
    }

    try {
      const entryData = {
        date: formData.date,
        marketplace: formData.marketplace,
        amount: parseFloat(formData.amount) || 0,
        orders: parseFloat(formData.orders) || 0,
        commission: parseFloat(formData.commission) || 0,
        note: formData.note,
      };

      if (editingEntry) {
        updateIncomeEntry(editingEntry.id, entryData);
        addToast('Data pendapatan berhasil diperbarui', 'success');
      } else {
        addIncomeEntry(entryData);
        addToast('Data pendapatan berhasil ditambahkan', 'success');
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        marketplace: 'shopee',
        amount: '',
        orders: '',
        commission: '',
        note: '',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      addToast('Gagal menyimpan data: ' + error.message, 'error');
    }
  };

  const marketplaceInfo = MARKETPLACE_SOURCES.find(m => m.code === formData.marketplace);

  return (
    <AppCard className="income-input-form">
      <div className="card-header">
        <div>
          <h3>📥 {editingEntry ? 'Edit Data Pendapatan' : 'Input Pendapatan Harian'}</h3>
          <p>Catat penjualan dari berbagai channel marketplace</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Tanggal */}
          <div className="form-group">
            <label>Tanggal</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Pilih Marketplace */}
          <div className="form-group">
            <label>Channel Marketplace</label>
            <div className="marketplace-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
              {MARKETPLACE_SOURCES.map((mp) => (
                <button
                  key={mp.code}
                  type="button"
                  className={`marketplace-option ${formData.marketplace === mp.code ? 'active' : ''}`}
                  onClick={() => handleChange('marketplace', mp.code)}
                  style={{
                    padding: '12px',
                    border: `2px solid ${formData.marketplace === mp.code ? mp.color : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: formData.marketplace === mp.code ? `${mp.color}15` : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.9em',
                  }}
                >
                  <span style={{ fontSize: '1.5em' }}>{mp.icon}</span>
                  <span style={{ fontSize: '0.8em', fontWeight: 500 }}>{mp.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Penjualan */}
          <AppInput
            label="Penjualan (Rp)"
            type="number"
            inputMode="decimal"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            placeholder="Masukkan jumlah penjualan"
            required
          />

          {/* Jumlah Pesanan */}
          <AppInput
            label="Jumlah Pesanan"
            type="number"
            inputMode="numeric"
            value={formData.orders}
            onChange={(e) => handleChange('orders', e.target.value)}
            placeholder="Contoh: 15"
          />

          {/* Komisi */}
          <AppInput
            label="Komisi Marketplace (Rp)"
            type="number"
            inputMode="decimal"
            value={formData.commission}
            onChange={(e) => handleChange('commission', e.target.value)}
            placeholder="Komisi atau biaya"
          />

          {/* Catatan */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Catatan (opsional)</label>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="Catatan tambahan..."
              className="form-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="form-summary" style={{ 
          marginTop: '20px', 
          padding: '16px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>Penjualan</div>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#2563eb' }}>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.amount || 0)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>Pesanan</div>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#16a34a' }}>
              {formData.orders || 0} order
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>Komisi</div>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#dc2626' }}>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.commission || 0)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>Bersih</div>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#7c3aed' }}>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format((formData.amount || 0) - (formData.commission || 0))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <AppButton
            type="submit"
            variant="primary"
            style={{ fontSize: '1em', padding: '12px 24px' }}
          >
            {editingEntry ? '✏️ Perbarui Data' : '💾 Simpan Data'}
          </AppButton>
        </div>
      </form>
    </AppCard>
  );
}
