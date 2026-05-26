import AppInput from './AppInput';

export default function EmployeeForm({ employee, onChange }) {
  return (
    <div className="editor-section">
      <div className="section-header">
        <div>
          <h3>Employee details</h3>
          <p className="section-subtitle">Edit employee profile fields for the current slip.</p>
        </div>
      </div>

      <div className="form-grid">
        <AppInput label="Nama karyawan" value={employee.name} onChange={(e) => onChange('employee', 'name', e.target.value)} placeholder="Nama karyawan" />
        <AppInput label="Jabatan" value={employee.position} onChange={(e) => onChange('employee', 'position', e.target.value)} placeholder="Posisi" />
        <AppInput label="Departemen" value={employee.department} onChange={(e) => onChange('employee', 'department', e.target.value)} placeholder="Departemen" />
      </div>
    </div>
  );
}
