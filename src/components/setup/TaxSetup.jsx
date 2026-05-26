import React, { useState } from 'react';
import AppInput from '../AppInput';
import AppButton from '../AppButton';

const TaxSetup = ({ data, onUpdate }) => {
  const [tax, setTax] = useState(data || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTax((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setTax((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSave = () => {
    onUpdate(tax);
  };

  return (
    <div className="setup-section tax-setup">
      <div className="setup-grid">
        {/* Left Column - Tax Settings */}
        <div className="setup-column">
          <div className="setup-card">
            <h3 className="card-title">🏛️ Pengaturan Pajak</h3>

            <div className="form-group">
              <label>PPN (Pajak Pertambahan Nilai) %</label>
              <input
                type="number"
                name="ppn"
                value={tax.ppn || ''}
                onChange={handleNumberChange}
                placeholder="10"
                step="0.01"
                className="form-input"
              />
              <p className="form-hint">Standar PPN Indonesia adalah 11% (per 1 Januari 2025)</p>
            </div>

            <div className="form-group">
              <label>PPh (Pajak Penghasilan) %</label>
              <input
                type="number"
                name="pph"
                value={tax.pph || ''}
                onChange={handleNumberChange}
                placeholder="15"
                step="0.01"
                className="form-input"
              />
              <p className="form-hint">PPh Badan standar adalah 19% s.d 31%</p>
            </div>

            <div className="form-group">
              <label>Pajak Default</label>
              <select
                name="defaultTax"
                value={tax.defaultTax || 'ppn'}
                onChange={handleChange}
                className="form-select"
              >
                <option value="ppn">PPN</option>
                <option value="pph">PPh</option>
                <option value="none">Tidak Ada</option>
              </select>
            </div>
          </div>

          <div className="setup-card" style={{ marginTop: '24px' }}>
            <h3 className="card-title">📋 Nomor Seri Dokumen</h3>

            <div className="form-group">
              <label>Format Invoice</label>
              <input
                type="text"
                name="invoiceFormat"
                value={tax.invoiceFormat || 'INV-{MM}{YYYY}-{001}'}
                onChange={handleChange}
                placeholder="INV-{MM}{YYYY}-{001}"
                className="form-input"
              />
              <p className="form-hint">Gunakan {'{MM}'}, {'{YYYY}'}, {'{001}'} sebagai placeholder</p>
            </div>

            <div className="form-group">
              <label>Format Kuitansi</label>
              <input
                type="text"
                name="receiptFormat"
                value={tax.receiptFormat || 'RCP-{YYYY}{MM}{DD}-{001}'}
                onChange={handleChange}
                placeholder="RCP-{YYYY}{MM}{DD}-{001}"
                className="form-input"
              />
              <p className="form-hint">Gunakan {'{YYYY}'}, {'{MM}'}, {'{DD}'}, {'{001}'} sebagai placeholder</p>
            </div>

            <div className="form-group">
              <label>Format Slip Gaji</label>
              <input
                type="text"
                name="salaryFormat"
                value={tax.salaryFormat || 'SL-{MM}{YYYY}-{001}'}
                onChange={handleChange}
                placeholder="SL-{MM}{YYYY}-{001}"
                className="form-input"
              />
              <p className="form-hint">Gunakan {'{MM}'}, {'{YYYY}'}, {'{001}'} sebagai placeholder</p>
            </div>

            <div className="form-group">
              <label>Nomor Awal Invoice</label>
              <input
                type="number"
                name="invoiceStartNumber"
                value={tax.invoiceStartNumber || '1'}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Format Settings */}
        <div className="setup-column">
          <div className="setup-card">
            <h3 className="card-title">💱 Format Angka & Mata Uang</h3>

            <div className="form-group">
              <label>Pemisah Ribuan</label>
              <select
                name="thousandSeparator"
                value={tax.thousandSeparator || 'dot'}
                onChange={handleChange}
                className="form-select"
              >
                <option value="dot">Titik (1.000.000)</option>
                <option value="comma">Koma (1,000,000)</option>
                <option value="space">Spasi (1 000 000)</option>
                <option value="none">Tidak Ada (1000000)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Pemisah Desimal</label>
              <select
                name="decimalSeparator"
                value={tax.decimalSeparator || 'comma'}
                onChange={handleChange}
                className="form-select"
              >
                <option value="comma">Koma (1.234,56)</option>
                <option value="dot">Titik (1,234.56)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Jumlah Desimal</label>
              <select
                name="decimalPlaces"
                value={tax.decimalPlaces || '2'}
                onChange={handleChange}
                className="form-select"
              >
                <option value="0">0 desimal</option>
                <option value="1">1 desimal</option>
                <option value="2">2 desimal</option>
                <option value="3">3 desimal</option>
              </select>
            </div>

            <div className="format-preview">
              <h4>Preview Format Angka:</h4>
              <div className="preview-item">
                <span className="label">Ribuan:</span>
                <span className="value">
                  {tax.thousandSeparator === 'dot'
                    ? '1.000.000'
                    : tax.thousandSeparator === 'comma'
                    ? '1,000,000'
                    : tax.thousandSeparator === 'space'
                    ? '1 000 000'
                    : '1000000'}
                </span>
              </div>
              <div className="preview-item">
                <span className="label">Desimal:</span>
                <span className="value">
                  {tax.decimalSeparator === 'comma'
                    ? '1.234,56'
                    : '1,234.56'}
                </span>
              </div>
            </div>
          </div>

          <div className="setup-card" style={{ marginTop: '24px' }}>
            <h3 className="card-title">⚙️ Pengaturan Lainnya</h3>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="autoCreateJournal"
                  checked={!!tax.autoCreateJournal}
                  onChange={(e) =>
                    setTax((prev) => ({
                      ...prev,
                      autoCreateJournal: e.target.checked,
                    }))
                  }
                />
                <span style={{ marginLeft: '8px' }}>
                  Buat jurnal otomatis untuk setiap transaksi
                </span>
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="requireTaxNumber"
                  checked={!!tax.requireTaxNumber}
                  onChange={(e) =>
                    setTax((prev) => ({
                      ...prev,
                      requireTaxNumber: e.target.checked,
                    }))
                  }
                />
                <span style={{ marginLeft: '8px' }}>
                  Wajib isi nomor pajak di setiap transaksi
                </span>
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="enableAuditTrail"
                  checked={!!tax.enableAuditTrail}
                  onChange={(e) =>
                    setTax((prev) => ({
                      ...prev,
                      enableAuditTrail: e.target.checked,
                    }))
                  }
                />
                <span style={{ marginLeft: '8px' }}>
                  Aktifkan audit trail untuk semua perubahan
                </span>
              </label>
            </div>

            <div className="form-group">
              <label>Tahun Buku Dimulai Bulan</label>
              <select
                name="fiscalYearStart"
                value={tax.fiscalYearStart || 'January'}
                onChange={handleChange}
                className="form-select"
              >
                <option value="January">Januari</option>
                <option value="February">Februari</option>
                <option value="March">Maret</option>
                <option value="April">April</option>
                <option value="May">Mei</option>
                <option value="June">Juni</option>
                <option value="July">Juli</option>
                <option value="August">Agustus</option>
                <option value="September">September</option>
                <option value="October">Oktober</option>
                <option value="November">November</option>
                <option value="December">Desember</option>
              </select>
            </div>
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
          ✓ Simpan Pengaturan
        </AppButton>
      </div>
    </div>
  );
};

export default TaxSetup;
