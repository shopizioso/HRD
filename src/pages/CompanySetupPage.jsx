import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import AppButton from '../components/AppButton';
import CompanyInfoSetup from '../components/setup/CompanyInfoSetup';
import AccountSetup from '../components/setup/AccountSetup';
import BankSetup from '../components/setup/BankSetup';
import CapitalSetup from '../components/setup/CapitalSetup';
import ExpenseSetup from '../components/setup/ExpenseSetup';
import LiabilitySetup from '../components/setup/LiabilitySetup';
import MarketplaceSetup from '../components/setup/MarketplaceSetup';
import TaxSetup from '../components/setup/TaxSetup';
import '../styles/CompanySetupPage.css';

const SETUP_TABS = [
  { id: 'company', label: 'Informasi Perusahaan', icon: '🏢', step: 1 },
  { id: 'accounts', label: 'Struktur Akun', icon: '📊', step: 2 },
  { id: 'bank', label: 'Kas & Bank', icon: '🏦', step: 3 },
  { id: 'capital', label: 'Modal & Saldo Awal', icon: '💰', step: 4 },
  { id: 'expense', label: 'Pengeluaran', icon: '💸', step: 5 },
  { id: 'liability', label: 'Kewajiban', icon: '📋', step: 6 },
  { id: 'marketplace', label: 'Marketplace', icon: '🛒', step: 7 },
  { id: 'tax', label: 'Pajak & Finance', icon: '⚙️', step: 8 },
];

const CompanySetupPage = () => {
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('company');
  const [setupData, setSetupData] = useState(() => {
    const saved = localStorage.getItem('setupData');
    return saved ? JSON.parse(saved) : {
      company: {},
      accounts: [],
      banks: [],
      capital: {},
      expenses: [],
      liabilities: [],
      marketplaces: [],
      tax: {},
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [completionStatus, setCompletionStatus] = useState(() => {
    const saved = localStorage.getItem('setupStatus');
    return saved ? JSON.parse(saved) : {};
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('setupData', JSON.stringify(setupData));
  }, [setupData]);

  useEffect(() => {
    localStorage.setItem('setupStatus', JSON.stringify(completionStatus));
  }, [completionStatus]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleUpdateData = (section, data) => {
    setSetupData((prev) => ({
      ...prev,
      [section]: data,
    }));
    setCompletionStatus((prev) => ({
      ...prev,
      [section]: true,
    }));
  };

  const handleSaveAllSetup = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Here you would call API to save all setup data
      // await saveCompanySetup(setupData);
      
      addToast('Setup perusahaan berhasil disimpan!', 'success');
      
      // Mark all as completed
      const allCompleted = SETUP_TABS.reduce((acc, tab) => ({
        ...acc,
        [tab.id]: true,
      }), {});
      setCompletionStatus(allCompleted);
    } catch (error) {
      addToast('Gagal menyimpan setup perusahaan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSetup = () => {
    if (window.confirm('Hapus semua data setup? Ini tidak bisa dibatalkan.')) {
      setSetupData({
        company: {},
        accounts: [],
        banks: [],
        capital: {},
        expenses: [],
        liabilities: [],
        marketplaces: [],
        tax: {},
      });
      setCompletionStatus({});
      localStorage.removeItem('setupData');
      localStorage.removeItem('setupStatus');
      addToast('Setup data berhasil direset', 'success');
    }
  };

  const completedSections = Object.values(completionStatus).filter(Boolean).length;
  const completionPercentage = Math.round((completedSections / SETUP_TABS.length) * 100);

  const renderActiveTab = () => {
    const props = {
      data: setupData[activeTab] || {},
      onUpdate: (data) => handleUpdateData(activeTab, data),
    };

    switch (activeTab) {
      case 'company':
        return <CompanyInfoSetup {...props} />;
      case 'accounts':
        return <AccountSetup {...props} />;
      case 'bank':
        return <BankSetup {...props} />;
      case 'capital':
        return <CapitalSetup {...props} />;
      case 'expense':
        return <ExpenseSetup {...props} />;
      case 'liability':
        return <LiabilitySetup {...props} />;
      case 'marketplace':
        return <MarketplaceSetup {...props} />;
      case 'tax':
        return <TaxSetup {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="company-setup-page">
      {/* Header */}
      <div className="setup-header">
        <div className="setup-title">
          <h1>⚙️ Setup Perusahaan</h1>
          <p>Konfigurasi struktur accounting dan sistem keuangan perusahaan</p>
        </div>
        
        {/* Progress Bar */}
        <div className="setup-progress">
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="progress-text">{completionPercentage}% Selesai</span>
          </div>
          <div className="progress-meta">
            {completedSections} dari {SETUP_TABS.length} section selesai
          </div>
        </div>
      </div>

      <div className="setup-container">
        {/* Sidebar Navigation */}
        <div className="setup-sidebar">
          <div className="sidebar-header">
            <h3>Setup Steps</h3>
          </div>
          
          <nav className="setup-nav">
            {SETUP_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`setup-nav-item ${activeTab === tab.id ? 'active' : ''} ${
                  completionStatus[tab.id] ? 'completed' : ''
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span className="nav-step">{tab.step}</span>
                <span className="nav-icon">{tab.icon}</span>
                <div className="nav-label">
                  <span className="nav-title">{tab.label}</span>
                  {completionStatus[tab.id] && <span className="nav-badge">✓</span>}
                </div>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="info-box">
              <p className="info-title">💡 Setup Wizard</p>
              <p className="info-text">Lakukan setup dari awal agar sistem accounting berjalan optimal.</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="setup-content">
          <div className="content-header">
            <div>
              {SETUP_TABS.map((tab) => {
                if (tab.id === activeTab) {
                  return (
                    <div key={tab.id}>
                      <h2 className="section-title">
                        {tab.icon} {tab.label}
                      </h2>
                      <p className="section-desc">
                        {getSectionDescription(tab.id)}
                      </p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            {completionStatus[activeTab] && (
              <div className="section-status completed">
                ✓ Sudah dikonfigurasi
              </div>
            )}
          </div>

          {/* Dynamic Content */}
          <div className="content-body">
            {renderActiveTab()}
          </div>

          {/* Navigation Buttons */}
          <div className="content-footer">
            <div className="footer-actions">
              <button
                className="nav-button prev"
                onClick={() => {
                  const currentIndex = SETUP_TABS.findIndex((t) => t.id === activeTab);
                  if (currentIndex > 0) {
                    handleTabChange(SETUP_TABS[currentIndex - 1].id);
                  }
                }}
                disabled={activeTab === 'company'}
              >
                ← Sebelumnya
              </button>

              <button
                className="nav-button next"
                onClick={() => {
                  const currentIndex = SETUP_TABS.findIndex((t) => t.id === activeTab);
                  if (currentIndex < SETUP_TABS.length - 1) {
                    handleTabChange(SETUP_TABS[currentIndex + 1].id);
                  }
                }}
                disabled={activeTab === 'tax'}
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="setup-save-bar">
        <div className="save-bar-content">
          <div className="save-status">
            <span className="save-icon">💾</span>
            <p>Data tersimpan otomatis di perangkat Anda</p>
          </div>
          <div className="save-actions">
            <AppButton
              variant="secondary"
              onClick={handleResetSetup}
              style={{ padding: '10px 16px', fontSize: '14px' }}
            >
              🔄 Reset Setup
            </AppButton>
            <AppButton
              variant="primary"
              onClick={handleSaveAllSetup}
              disabled={isSaving || completionPercentage < 50}
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              {isSaving ? '⏳ Menyimpan...' : '✓ Simpan & Aktifkan Sistem'}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
};

function getSectionDescription(sectionId) {
  const descriptions = {
    company: 'Informasi dasar perusahaan, logo, dan preferensi sistem',
    accounts: 'Konfigurasi Chart of Accounts dan struktur akun keuangan',
    bank: 'Daftar rekening bank, cash, dan alat pembayaran digital',
    capital: 'Modal awal dan saldo pembukaan untuk semua akun',
    expense: 'Kategori pengeluaran dan biaya operasional',
    liability: 'Hutang, kewajiban, dan liabilitas perusahaan',
    marketplace: 'Integrasi toko online dan channel penjualan',
    tax: 'Konfigurasi pajak, nomor seri, dan format keuangan',
  };
  return descriptions[sectionId] || '';
}

export default CompanySetupPage;
