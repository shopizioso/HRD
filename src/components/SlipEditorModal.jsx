import AppButton from './AppButton';
import AppModal from './AppModal';
import AppInput from './AppInput';
import CompanyForm from './CompanyForm';
import EmployeeForm from './EmployeeForm';
import SalaryForm from './SalaryForm';
import DeductionForm from './DeductionForm';

export default function SlipEditorModal({ open, data, onChange, onLogoUpload, onClose, onReset }) {
  if (!data) return null;

  const handleSectionChange = (section, key, value) => {
    onChange(section, key, value);
  };

  return (
    <AppModal open={open} title="Edit Payroll Slip" onClose={onClose}>
      <div className="editor-section">
        <CompanyForm company={data.company} onChange={handleSectionChange} onLogoUpload={onLogoUpload} />
      </div>

      <div className="editor-section">
        <EmployeeForm employee={data.employee} onChange={handleSectionChange} />
      </div>

      <div className="editor-section editor-two-col">
        <SalaryForm salary={data.employee} onChange={handleSectionChange} />
        <DeductionForm deductions={data.employee} onChange={handleSectionChange} />
      </div>

      <div className="editor-section">
        <div className="section-header">
          <div>
            <h3>Slip details</h3>
            <p className="section-subtitle">Update slip metadata, approval and footer text.</p>
          </div>
        </div>

        <div className="form-grid">
          <AppInput label="Nomor slip" value={data.slip.number} onChange={(e) => handleSectionChange('slip', 'number', e.target.value)} placeholder="Contoh: SL-202605-001" />
          <AppInput label="Periode" value={data.slip.period} onChange={(e) => handleSectionChange('slip', 'period', e.target.value)} placeholder="Contoh: Mei 2026" />
          <AppInput label="Hari hadir" type="number" value={data.slip.presentDays} onChange={(e) => handleSectionChange('slip', 'presentDays', Number(e.target.value))} placeholder="22" />
          <AppInput label="Hari cuti" type="number" value={data.slip.leaveDays} onChange={(e) => handleSectionChange('slip', 'leaveDays', Number(e.target.value))} placeholder="0" />
          <AppInput label="Hari sakit" type="number" value={data.slip.sickDays} onChange={(e) => handleSectionChange('slip', 'sickDays', Number(e.target.value))} placeholder="0" />
          <AppInput label="Nama HRD" value={data.slip.hrdName} onChange={(e) => handleSectionChange('slip', 'hrdName', e.target.value)} placeholder="Nama HRD" />
          <AppInput label="Tanda tangan" value={data.slip.signature} onChange={(e) => handleSectionChange('slip', 'signature', e.target.value)} placeholder="Nama/Tanda tangan" />
          <AppInput as="textarea" label="Catatan tambahan" value={data.slip.note} onChange={(e) => handleSectionChange('slip', 'note', e.target.value)} placeholder="Dokumen ini sah tanpa tanda tangan basah" rows={4} />
        </div>
      </div>

      <div className="modal-actions">
        <AppButton variant="secondary" onClick={onReset}>Reset</AppButton>
        <AppButton onClick={onClose}>Done Editing</AppButton>
      </div>
    </AppModal>
  );
}
