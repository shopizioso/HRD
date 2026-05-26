import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import AppButton from '../../components/AppButton';
import '../../styles/accounting/GeneralJournalPage.css';

const GeneralJournalPage = () => {
  const { addToast } = useToast();
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [filterAccount, setFilterAccount] = useState('all');
  const [searchDesc, setSearchDesc] = useState('');

  // Mock journal entries
  const journalEntries = [];

  const accounts = [
    'Bank Account',
    'Salary Expense',
    'Income - Shopee',
    'Income - Tokopedia',
    'Income - TikTok',
    'Advertising Expense',
    'Marketplace Fee',
    'Hosting Expense',
  ];

  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      const accountMatch = filterAccount === 'all' || 
        entry.entries.some(e => e.acc === filterAccount);
      const descMatch = entry.description.toLowerCase().includes(searchDesc.toLowerCase());
      return accountMatch && descMatch;
    });
  }, [filterAccount, searchDesc]);

  const totalDebit = filteredEntries.reduce((sum, entry) => {
    return sum + entry.entries.reduce((s, e) => s + e.debit, 0);
  }, 0);

  const totalCredit = filteredEntries.reduce((sum, entry) => {
    return sum + entry.entries.reduce((s, e) => s + e.credit, 0);
  }, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const exportReport = (format) => {
    try {
      if (format === 'csv') {
        let content = 'Jurnal Umum PT Global Digital Zone\n';
        content += `Periode: ${new Date(monthYear + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}\n\n`;
        content += 'Tanggal,No. Referensi,Deskripsi,Akun,Debit,Kredit\n';
        
        filteredEntries.forEach(entry => {
          let firstRow = true;
          entry.entries.forEach(e => {
            if (firstRow) {
              content += `"${entry.date}","${entry.referenceNo}","${entry.description}","${e.acc}","${e.debit}","${e.credit}"\n`;
              firstRow = false;
            } else {
              content += `"","","","${e.acc}","${e.debit}","${e.credit}"\n`;
            }
          });
        });
        
        content += `\n"TOTAL","","","","${totalDebit}","${totalCredit}"\n`;
        downloadFile(content, `general-journal-${monthYear}.csv`, 'text/csv');
        addToast('Jurnal Umum diexport sebagai CSV', 'success');
      }
    } catch (err) {
      addToast('Gagal export laporan', 'error');
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="gj-report">
      <div className="gj-header">
        <div>
          <h1>📋 Jurnal Umum (General Journal)</h1>
          <p>Complete transaction log with debit/credit entries</p>
        </div>
        <div className="header-controls">
          <input
            type="month"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            className="date-input"
          />
          <AppButton
            onClick={() => exportReport('csv')}
            variant="secondary"
            style={{ fontSize: '0.9em', padding: '8px 12px' }}
          >
            📥 Export CSV
          </AppButton>
        </div>
      </div>

      {/* Filters */}
      <div className="gj-filters">
        <div className="filter-group">
          <label>Filter Akun</label>
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="filter-select"
          >
            <option value="all">Semua Akun</option>
            {accounts.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Cari Deskripsi</label>
          <input
            type="text"
            value={searchDesc}
            onChange={(e) => setSearchDesc(e.target.value)}
            placeholder="Masukkan deskripsi..."
            className="filter-input"
          />
        </div>

        <div className="filter-summary">
          <span>Total Entries: <strong>{filteredEntries.length}</strong></span>
          <span>Debit: <strong>{formatCurrency(totalDebit)}</strong></span>
          <span>Kredit: <strong>{formatCurrency(totalCredit)}</strong></span>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="gj-entries">
        {filteredEntries.length === 0 ? (
          <div className="empty-state">
            <p>Tidak ada jurnal yang cocok dengan filter</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="journal-entry">
              <div className="entry-header">
                <div className="entry-meta">
                  <span className="entry-date">{new Date(entry.date).toLocaleDateString('id-ID')}</span>
                  <span className="entry-ref">{entry.referenceNo}</span>
                  <span className="entry-desc">{entry.description}</span>
                </div>
              </div>

              <div className="entry-table">
                <div className="entry-row header">
                  <div className="col-account">Akun</div>
                  <div className="col-desc">Deskripsi</div>
                  <div className="col-debit">Debit</div>
                  <div className="col-credit">Kredit</div>
                </div>

                {entry.entries.map((e, idx) => (
                  <div key={idx} className="entry-row data">
                    <div className="col-account">{e.acc}</div>
                    <div className="col-desc">{e.desc}</div>
                    <div className="col-debit">
                      {e.debit > 0 ? formatCurrency(e.debit) : '—'}
                    </div>
                    <div className="col-credit">
                      {e.credit > 0 ? formatCurrency(e.credit) : '—'}
                    </div>
                  </div>
                ))}

                <div className="entry-row entry-total">
                  <div className="col-account">Total</div>
                  <div className="col-desc"></div>
                  <div className="col-debit">
                    {formatCurrency(entry.entries.reduce((s, e) => s + e.debit, 0))}
                  </div>
                  <div className="col-credit">
                    {formatCurrency(entry.entries.reduce((s, e) => s + e.credit, 0))}
                  </div>
                </div>
              </div>

              {entry.entries.reduce((s, e) => s + e.debit, 0) === entry.entries.reduce((s, e) => s + e.credit, 0) && (
                <div className="entry-balanced">✓ Seimbang</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Grand Totals */}
      <div className="gj-totals">
        <div className="total-row">
          <span className="total-label">TOTAL DEBIT</span>
          <span className="total-amount">{formatCurrency(totalDebit)}</span>
        </div>
        <div className="total-row">
          <span className="total-label">TOTAL KREDIT</span>
          <span className="total-amount">{formatCurrency(totalCredit)}</span>
        </div>
        <div className="total-check">
          {totalDebit === totalCredit ? '✓ Debit = Kredit' : '⚠️ Tidak Seimbang'}
        </div>
      </div>
    </div>
  );
};

export default GeneralJournalPage;
