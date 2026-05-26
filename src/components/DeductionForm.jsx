import AppInput from './AppInput';

export default function DeductionForm({ deductions, onChange }) {
  return (
    <div className="editor-section">
      <div className="section-header">
        <div>
          <h3>Deduction fields</h3>
          <p className="section-subtitle">Edit BPJS, tax and other reductions.</p>
        </div>
      </div>

      <div className="form-grid">
        <AppInput label="BPJS" type="number" inputMode="numeric" value={deductions.bpjs} onChange={(e) => onChange('employee', 'bpjs', Number(e.target.value) || 0)} placeholder="0" />
        <AppInput label="Pajak" type="number" inputMode="numeric" value={deductions.tax} onChange={(e) => onChange('employee', 'tax', Number(e.target.value) || 0)} placeholder="0" />
        <AppInput label="Potongan lain" type="number" inputMode="numeric" value={deductions.otherDeduction} onChange={(e) => onChange('employee', 'otherDeduction', Number(e.target.value) || 0)} placeholder="0" />
      </div>
    </div>
  );
}
