import { useEffect, useState } from 'react';
import AppButton from '../components/AppButton';
import SlipPreview from '../components/SlipPreview';
import SlipEditorModal from '../components/SlipEditorModal';
import SaveIndicator from '../components/SaveIndicator';
import { SlipHistory } from '../components/SlipHistory';
import { useAutoSaveSlip } from '../hooks/useAutoSaveSlip';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function SlipPage({ slipData, onUpdateSlip, onExport, onBack, exportMessage }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [draftData, setDraftData] = useState(slipData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSave = useAutoSaveSlip(draftData, () => {
    setIsSaving(false);
    setLastSaved(new Date());
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+e': () => setEditorOpen(true),
    'ctrl+p': () => onExport(),
    'escape': () => setEditorOpen(false),
  });

  useEffect(() => {
    setDraftData(slipData);
  }, [slipData]);

  const currentPreview = editorOpen ? draftData : slipData;

  const handleDraftChange = (section, key, value) => {
    setIsSaving(true);
    setDraftData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleLogoUpload = (logo) => {
    handleDraftChange('company', 'logo', logo);
  };

  const handleModalClose = () => {
    // Data sudah otomatis tersimpan via auto-save
    onUpdateSlip(draftData);
    setEditorOpen(false);
  };

  const handleReset = () => {
    setDraftData(slipData);
    setLastSaved(null);
  };

  return (
    <div className="page-shell">
      <div className="page-header page-header-with-actions">
        <div>
          <p className="eyebrow">Payroll Slip</p>
          <h1>Salary slip preview</h1>
        </div>
        <div className="page-actions">
          <AppButton variant="secondary" onClick={onBack}>← Kembali</AppButton>
          <AppButton variant="secondary" onClick={() => setEditorOpen(true)}>✏ Edit Slip</AppButton>
          <AppButton onClick={onExport}>⬇ Download PDF</AppButton>
        </div>
      </div>

      <section className="section-block">
        <div className="slip-preview-wrapper">
          <SlipPreview company={currentPreview.company} employee={currentPreview.employee} slip={currentPreview.slip} />
          <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', alignItems: 'start' }}>
        <SlipHistory employeeId={slipData.employee.id} />
        <div className="section-block" style={{ animation: 'slideInUp 0.4s ease 0.2s both' }}>
          <h3>Informasi</h3>
          <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text)' }}>Periode Gaji</p>
              <p style={{ margin: 0 }}>{slipData.slip.period}</p>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text)' }}>Hari Kerja</p>
              <p style={{ margin: 0 }}>{slipData.slip.presentDays} hari</p>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text)' }}>Status</p>
              <span style={{
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                color: 'var(--success)',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}>
                ✓ Terkirim
              </span>
            </div>
          </div>
        </div>
      </div>

      {exportMessage && <div className="toast-message">{exportMessage}</div>}

      <SlipEditorModal
        open={editorOpen}
        data={draftData}
        onChange={handleDraftChange}
        onLogoUpload={handleLogoUpload}
        onClose={handleModalClose}
        onReset={handleReset}
      />
    </div>
  );
}
