import AppInput from './AppInput';

export default function SalaryForm({ salary, onChange }) {
  return (
    <div className="editor-section">
      <div className="section-header">
        <div>
          <h3>Salary fields</h3>
          <p className="section-subtitle">Adjust base pay, allowance and overtime values.</p>
        </div>
      </div>

      <div className="form-grid">
        <AppInput label="Gaji pokok" type="number" inputMode="numeric" value={salary.baseSalary} onChange={(e) => onChange('employee', 'baseSalary', Number(e.target.value) || 0)} placeholder="0" />
        <AppInput label="Tunjangan" type="number" inputMode="numeric" value={salary.allowance} onChange={(e) => onChange('employee', 'allowance', Number(e.target.value) || 0)} placeholder="0" />
        <AppInput label="Bonus" type="number" inputMode="numeric" value={salary.bonus} onChange={(e) => onChange('employee', 'bonus', Number(e.target.value) || 0)} placeholder="0" />
        <AppInput label="Lembur" type="number" inputMode="numeric" value={salary.overtime} onChange={(e) => onChange('employee', 'overtime', Number(e.target.value) || 0)} placeholder="0" />
      </div>
    </div>
  );
}
