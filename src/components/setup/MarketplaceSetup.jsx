import React, { useState } from 'react';
import AppButton from '../AppButton';

const MARKETPLACE_OPTIONS = [
  { code: 'shopee', name: 'Shopee', icon: '🛒', color: '#EE0000' },
  { code: 'tokopedia', name: 'Tokopedia', icon: '🏪', color: '#05AC10' },
  { code: 'tiktok', name: 'TikTok Shop', icon: '🎵', color: '#000000' },
  { code: 'lazada', name: 'Lazada', icon: '🎁', color: '#2A1F33' },
  { code: 'website', name: 'Website', icon: '🌐', color: '#0066CC' },
];

const MarketplaceSetup = ({ data, onUpdate }) => {
  const [marketplaces, setMarketplaces] = useState(data?.marketplaces || []);
  const [newMarketplace, setNewMarketplace] = useState({
    marketplaceCode: '',
    storeName: '',
    initialBalance: '',
    commissionRate: '',
    isActive: true,
  });

  const handleAddMarketplace = () => {
    if (!newMarketplace.marketplaceCode || !newMarketplace.storeName) {
      alert('Marketplace dan nama toko harus dipilih/diisi');
      return;
    }

    const marketplace = {
      id: Date.now(),
      ...newMarketplace,
      initialBalance: parseFloat(newMarketplace.initialBalance) || 0,
      commissionRate: parseFloat(newMarketplace.commissionRate) || 0,
      marketplaceName: MARKETPLACE_OPTIONS.find((m) => m.code === newMarketplace.marketplaceCode)?.name,
    };

    setMarketplaces([...marketplaces, marketplace]);
    setNewMarketplace({
      marketplaceCode: '',
      storeName: '',
      initialBalance: '',
      commissionRate: '',
      isActive: true,
    });
  };

  const handleDeleteMarketplace = (id) => {
    setMarketplaces(marketplaces.filter((m) => m.id !== id));
  };

  const handleToggleActive = (id) => {
    setMarketplaces(
      marketplaces.map((m) =>
        m.id === id ? { ...m, isActive: !m.isActive } : m
      )
    );
  };

  const handleSave = () => {
    onUpdate({ marketplaces });
  };

  const getMarketplaceInfo = (code) => {
    return MARKETPLACE_OPTIONS.find((m) => m.code === code);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalBalance = marketplaces.reduce((sum, m) => sum + m.initialBalance, 0);

  return (
    <div className="setup-section marketplace-setup">
      {/* Add New Marketplace */}
      <div className="setup-card">
        <h3 className="card-title">🛒 Tambah Channel Marketplace</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Pilih Marketplace</label>
            <div className="marketplace-selector">
              {MARKETPLACE_OPTIONS.map((mp) => (
                <button
                  key={mp.code}
                  className={`mp-option ${newMarketplace.marketplaceCode === mp.code ? 'active' : ''}`}
                  onClick={() =>
                    setNewMarketplace((prev) => ({
                      ...prev,
                      marketplaceCode: mp.code,
                    }))
                  }
                  style={{
                    borderColor: newMarketplace.marketplaceCode === mp.code ? mp.color : '#e5e7eb',
                  }}
                >
                  <span className="mp-icon">{mp.icon}</span>
                  <span className="mp-name">{mp.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Nama Toko</label>
            <input
              type="text"
              value={newMarketplace.storeName}
              onChange={(e) =>
                setNewMarketplace((prev) => ({
                  ...prev,
                  storeName: e.target.value,
                }))
              }
              placeholder="e.g., Toko GDZ Official"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Saldo Awal Toko</label>
            <input
              type="number"
              value={newMarketplace.initialBalance}
              onChange={(e) =>
                setNewMarketplace((prev) => ({
                  ...prev,
                  initialBalance: e.target.value,
                }))
              }
              placeholder="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Komisi / Fee (%)</label>
            <input
              type="number"
              value={newMarketplace.commissionRate}
              onChange={(e) =>
                setNewMarketplace((prev) => ({
                  ...prev,
                  commissionRate: e.target.value,
                }))
              }
              placeholder="e.g., 5"
              className="form-input"
            />
          </div>
        </div>

        <AppButton
          variant="primary"
          onClick={handleAddMarketplace}
          style={{ width: '100%', marginTop: '16px' }}
        >
          ➕ Tambah Channel
        </AppButton>
      </div>

      {/* Marketplaces List */}
      <div className="setup-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">📊 Daftar Channel ({marketplaces.length})</h3>
          <div className="balance-summary">
            <span className="balance-label">Total Saldo:</span>
            <span className="balance-amount">{formatCurrency(totalBalance)}</span>
          </div>
        </div>

        {marketplaces.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada channel marketplace yang ditambahkan</p>
          </div>
        ) : (
          <div className="marketplaces-grid">
            {marketplaces.map((marketplace) => {
              const mpInfo = getMarketplaceInfo(marketplace.marketplaceCode);
              return (
                <div
                  key={marketplace.id}
                  className={`mp-card ${marketplace.isActive ? '' : 'inactive'}`}
                  style={{ borderColor: mpInfo?.color }}
                >
                  <div className="mp-header">
                    <div className="mp-info">
                      <span className="mp-icon">{mpInfo?.icon}</span>
                      <div>
                        <h4>{marketplace.marketplaceName}</h4>
                        <p className="store-name">{marketplace.storeName}</p>
                      </div>
                    </div>
                    <span className={`status-badge ${marketplace.isActive ? 'active' : 'inactive'}`}>
                      {marketplace.isActive ? '✓ Aktif' : '✗ Nonaktif'}
                    </span>
                  </div>

                  <div className="mp-details">
                    <div className="detail-row">
                      <span className="label">Saldo:</span>
                      <span className="value">{formatCurrency(marketplace.initialBalance)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Komisi:</span>
                      <span className="value">{marketplace.commissionRate}%</span>
                    </div>
                  </div>

                  <div className="mp-actions">
                    <AppButton
                      variant="secondary"
                      onClick={() => handleToggleActive(marketplace.id)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      {marketplace.isActive ? '🔒 Nonaktifkan' : '🔓 Aktifkan'}
                    </AppButton>
                    <AppButton
                      variant="secondary"
                      onClick={() => handleDeleteMarketplace(marketplace.id)}
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
          ✓ Simpan Channel
        </AppButton>
      </div>
    </div>
  );
};

export default MarketplaceSetup;
