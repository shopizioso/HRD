import React, { useState } from 'react';
import AppInput from '../AppInput';
import AppButton from '../AppButton';

const CapitalSetup = ({ data, onUpdate }) => {
  const [capital, setCapital] = useState(data || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCapital((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSave = () => {
    if (!capital.capitalContributed) {
      alert('Modal disetor harus diisi');
      return;
    }
    onUpdate(capital);
  };

  const totalOpeningBalance =
    (capital.capitalContributed || 0) +
    (capital.initialCash || 0) +
    (capital.initialBank || 0) +
    (capital.initialReceivables || 0) +
    (capital.initialInventory || 0) -
    (capital.initialPayables || 0) -
    (capital.initialDebt || 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <div className="setup-section capital-setup">
      <div className="setup-grid">
        {/* Left Column - Capital */}
        <div className="setup-column">
          <div className="setup-card">
            <h3 className="card-title">💰 Modal Awal</h3>

            <div className="form-group">
              <label>Modal Disetor *</label>
              <input
                type="number"
                name="capitalContributed"
                value={capital.capitalContributed || ''}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
              <p className="form-hint">Jumlah modal yang disetor pemilik</p>
            </div>

            <div className="info-box">
              <h4>📊 Saldo Modal:</h4>
              <p className="balance-text">
                {formatCurrency(capital.capitalContributed)}
              </p>
            </div>
          </div>

          <div className="setup-card" style={{ marginTop: '24px' }}>
            <h3 className="card-title">💵 Kas & Bank Awal</h3>

            <div className="form-group">
              <label>Saldo Awal Kas Kecil</label>
              <input
                type="number"
                name="initialCash"
                value={capital.initialCash || ''}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Saldo Awal Bank</label>
              <input
                type="number"
                name="initialBank"
                value={capital.initialBank || ''}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="balance-box">
              <span>Total Kas & Bank:</span>
              <strong>
                {formatCurrency(
                  (capital.initialCash || 0) + (capital.initialBank || 0)
                )}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column - Assets & Liabilities */}
        <div className="setup-column">
          <div className="setup-card">
            <h3 className="card-title">📦 Aset Awal Lainnya</h3>

            <div className="form-group">
              <label>Saldo Awal Piutang Usaha</label>
              <input
                type="number"
                name="initialReceivables"
                value={capital.initialReceivables || ''}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
              <p className="form-hint">Piutang dari pelanggan</p>
            </div>

            <div className="form-group">
              <label>Saldo Awal Persediaan</label>
              <input
                type="number"
                name="initialInventory"
                value={capital.initialInventory || ''}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
              <p className="form-hint">Barang dagangan awal</p>
            </div>

            <div className="balance-box">
              <span>Total Aset:</span>
              <strong>
                {formatCurrency(
                  (capital.capitalContributed || 0) +
                    (capital.initialCash || 0) +
                    (capital.initialBank || 0) +
                    (capital.initialReceivables || 0) +
                    (capital.initialInventory || 0)
                )}
              </strong>
            </div>
          </div>

          <div className="setup-card" style={{ marginTop: '24px' }}>
            <h3 className="card-title">📋 Kewajiban Awal</h3>

            <div className="form-group">
              <label>Hutang Usaha Awal</label>
              <input
                type="number"
                name="initialPayables"
                value={capital.initialPayables || ''}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Kewajiban Lainnya</label>
              <input
                type="number"
                name="initialDebt"
                value={capital.initialDebt || ''}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="balance-box">
              <span>Total Kewajiban:</span>
              <strong>
                {formatCurrency(
                  (capital.initialPayables || 0) + (capital.initialDebt || 0)
                )}
              </strong>
            </div>
          </div>

          {/* Summary Card */}
          <div className="setup-card summary-card" style={{ marginTop: '24px' }}>
            <h3 className="card-title">✓ Saldo Pembukuan</h3>
            <div className="summary-items">
              <div className="summary-item">
                <span>Aset</span>
                <strong className="positive">
                  +{formatCurrency(
                    (capital.capitalContributed || 0) +
                      (capital.initialCash || 0) +
                      (capital.initialBank || 0) +
                      (capital.initialReceivables || 0) +
                      (capital.initialInventory || 0)
                  )}
                </strong>
              </div>
              <div className="summary-item">
                <span>Kewajiban</span>
                <strong className="negative">
                  -{formatCurrency(
                    (capital.initialPayables || 0) + (capital.initialDebt || 0)
                  )}
                </strong>
              </div>
              <div className="summary-item total">
                <span>Modal</span>
                <strong className="highlight">
                  {formatCurrency(totalOpeningBalance)}
                </strong>
              </div>
            </div>
            {totalOpeningBalance > 0 && (
              <p className="success-text">✓ Neraca seimbang</p>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="setup-actions">
        <AppButton
          variant="primary"
          onClick={handleSave}
          style={{ width: '200px' }}
        >
          ✓ Simpan Modal
        </AppButton>
      </div>
    </div>
  );
};

export default CapitalSetup;
