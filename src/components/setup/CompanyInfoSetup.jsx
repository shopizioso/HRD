import React, { useState } from 'react';
import AppInput from '../AppInput';
import AppButton from '../AppButton';

const CompanyInfoSetup = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(data || {});
  const [logoPreview, setLogoPreview] = useState(data?.logo || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        setLogoPreview(base64);
        setFormData((prev) => ({
          ...prev,
          logo: base64,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.companyName || !formData.email) {
      alert('Nama perusahaan dan email harus diisi');
      return;
    }
    onUpdate(formData);
  };

  const currencies = ['IDR', 'USD', 'SGD', 'MYR'];
  const timezones = [
    'Asia/Jakarta',
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Kuala_Lumpur',
  ];
  const accountingPeriods = [
    'Januari - Desember',
    'April - Maret',
    'Juli - Juni',
    'Oktober - September',
  ];

  return (
    <div className="setup-section company-info-setup">
      <div className="setup-grid">
        {/* Left Column */}
        <div className="setup-column">
          <div className="setup-card">
            <h3 className="card-title">📋 Identitas Perusahaan</h3>
            
            <div className="form-group">
              <label>Nama Perusahaan *</label>
              <AppInput
                name="companyName"
                value={formData.companyName || ''}
                onChange={handleChange}
                placeholder="PT Global Digital Zone"
              />
            </div>

            <div className="form-group">
              <label>Email Perusahaan *</label>
              <AppInput
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="info@company.com"
              />
            </div>

            <div className="form-group">
              <label>Nomor Telepon</label>
              <AppInput
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="+62 274-1234567"
              />
            </div>

            <div className="form-group">
              <label>Alamat Perusahaan</label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Jl Sunan Kudus, Tamantirto, Kasihan, Bantul, Yogyakarta"
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>NPWP</label>
              <AppInput
                name="npwp"
                value={formData.npwp || ''}
                onChange={handleChange}
                placeholder="12.345.678.9-123.456"
              />
            </div>

            <div className="form-group">
              <label>Nama Direktur</label>
              <AppInput
                name="directorName"
                value={formData.directorName || ''}
                onChange={handleChange}
                placeholder="Nama Direktur"
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="setup-column">
          <div className="setup-card">
            <h3 className="card-title">🏢 Logo & Branding</h3>
            
            <div className="form-group">
              <label>Logo Perusahaan</label>
              <div className="logo-upload">
                <div className="logo-preview-box">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="logo-preview" />
                  ) : (
                    <div className="logo-placeholder">
                      <span>📸</span>
                      <p>Logo belum diupload</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="logo-input"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                />
                <AppButton
                  variant="secondary"
                  onClick={() => document.getElementById('logo-input').click()}
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  📤 Upload Logo
                </AppButton>
                <p className="form-hint">Format: JPG, PNG. Ukuran max: 2MB</p>
              </div>
            </div>

            <div className="setup-card" style={{ marginTop: '24px' }}>
              <h3 className="card-title">⚙️ Pengaturan Sistem</h3>

              <div className="form-group">
                <label>Mata Uang Default *</label>
                <select
                  name="currency"
                  value={formData.currency || 'IDR'}
                  onChange={handleChange}
                  className="form-select"
                >
                  {currencies.map((cur) => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select
                  name="timezone"
                  value={formData.timezone || 'Asia/Jakarta'}
                  onChange={handleChange}
                  className="form-select"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Periode Akuntansi</label>
                <select
                  name="accountingPeriod"
                  value={formData.accountingPeriod || 'Januari - Desember'}
                  onChange={handleChange}
                  className="form-select"
                >
                  {accountingPeriods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
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
          ✓ Simpan Informasi
        </AppButton>
      </div>
    </div>
  );
};

export default CompanyInfoSetup;
