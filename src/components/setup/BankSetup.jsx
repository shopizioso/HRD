import React, { useState } from 'react';
import AppInput from '../AppInput';
import AppButton from '../AppButton';

const BANK_OPTIONS = [
  { code: 'bca', name: 'Bank BCA', icon: '🏦', color: '#0066CC' },
  { code: 'mandiri', name: 'Bank Mandiri', icon: '🏦', color: '#FF6600' },
  { code: 'bri', name: 'Bank BRI', icon: '🏦', color: '#004B87' },
  { code: 'cimb', name: 'Bank CIMB Niaga', icon: '🏦', color: '#0099FF' },
  { code: 'seabank', name: 'SeaBank', icon: '💳', color: '#00A86B' },
  { code: 'dana', name: 'DANA', icon: '📱', color: '#6200EA' },
  { code: 'ovo', name: 'OVO', icon: '📱', color: '#591F42' },
  { code: 'gopay', name: 'GoPay', icon: '📱', color: '#00A699' },
  { code: 'cash', name: 'Kas Kecil', icon: '💵', color: '#FFA500' },
];

const BankSetup = ({ data, onUpdate }) => {
  const [banks, setBanks] = useState(data?.banks || []);
  const [newBank, setNewBank] = useState({
    bankCode: '',
    accountName: '',
    accountNumber: '',
    holderName: '',
    initialBalance: '',
    isDefault: false,
  });

  const handleAddBank = () => {
    if (!newBank.bankCode || !newBank.accountName) {
      alert('Bank dan nama akun harus dipilih/diisi');
      return;
    }

    const bank = {
      id: Date.now(),
      ...newBank,
      initialBalance: parseFloat(newBank.initialBalance) || 0,
      isActive: true,
      bankName: BANK_OPTIONS.find((b) => b.code === newBank.bankCode)?.name,
    };

    setBanks([...banks, bank]);
    setNewBank({
      bankCode: '',
      accountName: '',
      accountNumber: '',
      holderName: '',
      initialBalance: '',
      isDefault: false,
    });
  };

  const handleSetDefault = (id) => {
    setBanks(
      banks.map((b) => ({
        ...b,
        isDefault: b.id === id,
      }))
    );
  };

  const handleDeleteBank = (id) => {
    if (window.confirm('Hapus rekening ini?')) {
      setBanks(banks.filter((b) => b.id !== id));
    }
  };

  const handleSave = () => {
    onUpdate({ banks });
  };

  const getBankInfo = (code) => {
    return BANK_OPTIONS.find((b) => b.code === code);
  };

  const totalBalance = banks.reduce((sum, b) => sum + b.initialBalance, 0);

  return (
    <div className="setup-section bank-setup">
      {/* Add New Bank */}
      <div className="setup-card">
        <h3 className="card-title">🏦 Tambah Rekening Baru</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Pilih Bank / E-Wallet</label>
            <select
              value={newBank.bankCode}
              onChange={(e) =>
                setNewBank((prev) => ({ ...prev, bankCode: e.target.value }))
              }
              className="form-select"
            >
              <option value="">-- Pilih Bank --</option>
              {BANK_OPTIONS.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.icon} {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nama Akun</label>
            <input
              type="text"
              value={newBank.accountName}
              onChange={(e) =>
                setNewBank((prev) => ({ ...prev, accountName: e.target.value }))
              }
              placeholder="e.g., Rekening Operasional"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Nomor Rekening</label>
            <input
              type="text"
              value={newBank.accountNumber}
              onChange={(e) =>
                setNewBank((prev) => ({
                  ...prev,
                  accountNumber: e.target.value,
                }))
              }
              placeholder="1234567890"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Atas Nama</label>
            <input
              type="text"
              value={newBank.holderName}
              onChange={(e) =>
                setNewBank((prev) => ({ ...prev, holderName: e.target.value }))
              }
              placeholder="Nama pemilik rekening"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Saldo Awal</label>
            <input
              type="number"
              value={newBank.initialBalance}
              onChange={(e) =>
                setNewBank((prev) => ({
                  ...prev,
                  initialBalance: e.target.value,
                }))
              }
              placeholder="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={newBank.isDefault}
                onChange={(e) =>
                  setNewBank((prev) => ({
                    ...prev,
                    isDefault: e.target.checked,
                  }))
                }
              />
              <span style={{ marginLeft: '8px' }}>Jadikan akun default</span>
            </label>
          </div>
        </div>

        <AppButton
          variant="primary"
          onClick={handleAddBank}
          style={{ width: '100%', marginTop: '16px' }}
        >
          ➕ Tambah Rekening
        </AppButton>
      </div>

      {/* Banks List */}
      <div className="setup-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">💰 Daftar Rekening ({banks.length})</h3>
          <div className="balance-summary">
            <span className="balance-label">Total Saldo:</span>
            <span className="balance-amount">
              Rp {totalBalance.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {banks.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada rekening yang ditambahkan</p>
          </div>
        ) : (
          <div className="banks-grid">
            {banks.map((bank) => {
              const bankInfo = getBankInfo(bank.bankCode);
              return (
                <div key={bank.id} className="bank-card">
                  <div className="bank-header">
                    <div>
                      <span className="bank-icon" style={{ fontSize: '24px' }}>
                        {bankInfo?.icon}
                      </span>
                      <span className="bank-name">{bank.bankName}</span>
                    </div>
                    {bank.isDefault && <span className="default-badge">DEFAULT</span>}
                  </div>

                  <div className="bank-details">
                    <div className="detail-row">
                      <span className="detail-label">Nama Akun:</span>
                      <span className="detail-value">{bank.accountName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">No. Rekening:</span>
                      <span className="detail-value">••••••{bank.accountNumber.slice(-4)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Atas Nama:</span>
                      <span className="detail-value">{bank.holderName}</span>
                    </div>
                    <div className="detail-row highlight">
                      <span className="detail-label">Saldo Awal:</span>
                      <span className="detail-value">
                        Rp {bank.initialBalance.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="bank-actions">
                    {!bank.isDefault && (
                      <AppButton
                        variant="secondary"
                        onClick={() => handleSetDefault(bank.id)}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        ⭐ Set Default
                      </AppButton>
                    )}
                    <AppButton
                      variant="secondary"
                      onClick={() => handleDeleteBank(bank.id)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      🗑️ Hapus
                    </AppButton>
                  </div>
                </div>
              );
            })}
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
          ✓ Simpan Rekening
        </AppButton>
      </div>
    </div>
  );
};

export default BankSetup;
