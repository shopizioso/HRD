import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { addIncomeEntry } from '../utils/incomeAPI';
import AppButton from './AppButton';
import '../styles/DataImport.css';

export default function DataImportComponent({ onSuccess }) {
  const { addToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.name.match(/\.(csv|xlsx?)$/i)) {
      addToast('Format file harus CSV atau Excel', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const lines = content.split('\n').filter(line => line.trim());
        const data = [];

        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim().replace(/"/g, ''));
          if (parts.length >= 5) {
            data.push({
              date: parts[0],
              marketplace: parts[1].toLowerCase(),
              amount: parseFloat(parts[2]),
              orders: parseInt(parts[3]) || 0,
              commission: parseFloat(parts[4]) || 0,
              notes: parts[5] || '',
            });
          }
        }

        if (data.length === 0) {
          addToast('Tidak ada data valid dalam file', 'error');
          return;
        }

        setPreview(data);
        addToast(`${data.length} baris siap diimport`, 'success');
      } catch (error) {
        addToast('Error membaca file: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      addToast('Tidak ada data untuk diimport', 'error');
      return;
    }

    setImporting(true);
    try {
      for (const entry of preview) {
        await addIncomeEntry(entry);
      }
      addToast(`${preview.length} data berhasil diimport!`, 'success');
      setPreview([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      addToast('Error import: ' + error.message, 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="data-import">
      {preview.length === 0 ? (
        <>
          <div
            className={`drop-zone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-icon">📂</div>
            <div className="drop-text">
              <strong>Drag & drop file CSV/Excel di sini</strong>
              <p>atau klik untuk memilih file</p>
            </div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" className="file-input-label">
              Pilih File
            </label>
          </div>

          <div className="import-help">
            <h4>📋 Format CSV yang benar:</h4>
            <code>
              Tanggal,Marketplace,Penjualan,Pesanan,Komisi,Catatan
              <br />
              2026-05-26,shopee,5000000,12,500000,Penjualan pagi
            </code>
          </div>
        </>
      ) : (
        <>
          <div className="import-preview">
            <h4>Preview Data ({preview.length} baris)</h4>
            <div className="preview-table">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Marketplace</th>
                    <th style={{ textAlign: 'right' }}>Penjualan</th>
                    <th style={{ textAlign: 'center' }}>Order</th>
                    <th style={{ textAlign: 'right' }}>Komisi</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.date}</td>
                      <td>{row.marketplace}</td>
                      <td style={{ textAlign: 'right' }}>{row.amount.toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>{row.orders}</td>
                      <td style={{ textAlign: 'right' }}>{row.commission.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 10 && (
                <div className="preview-more">
                  +{preview.length - 10} baris lainnya
                </div>
              )}
            </div>
          </div>

          <div className="import-actions">
            <AppButton
              onClick={() => setPreview([])}
              variant="secondary"
              style={{ fontSize: '0.95em', padding: '10px 16px' }}
            >
              ← Batal
            </AppButton>
            <AppButton
              onClick={handleImport}
              disabled={importing}
              variant="primary"
              style={{ fontSize: '0.95em', padding: '10px 16px' }}
            >
              {importing ? '⏳ Importing...' : '✅ Import Sekarang'}
            </AppButton>
          </div>
        </>
      )}
    </div>
  );
}
