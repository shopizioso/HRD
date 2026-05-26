import { useEffect, useState } from 'react';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppModal from '../components/AppModal';
import AppTable from '../components/AppTable';

export default function EmployeesPage({ employees, onAddEmployee, onCreateSlip }) {
  const [addOpen, setAddOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', position: '', department: '', baseSalary: 0 });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || null);
  const [slipPeriod, setSlipPeriod] = useState('Mei 2026');

  useEffect(() => {
    if (!selectedEmployeeId && employees.length) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  const handleNewEmployeeChange = (key, value) => {
    setNewEmployee((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveNewEmployee = () => {
    if (!newEmployee.name.trim()) {
      return;
    }
    onAddEmployee?.(newEmployee);
    setNewEmployee({ name: '', position: '', department: '', baseSalary: 0 });
    setAddOpen(false);
  };

  const handleCreateSlip = () => {
    if (!selectedEmployeeId) {
      return;
    }
    onCreateSlip?.(selectedEmployeeId, slipPeriod);
    setCreateOpen(false);
  };

  return (
    <div className="page-shell">
      <div className="page-header page-header-with-actions">
        <div>
          <p className="eyebrow">Karyawan</p>
          <h1>Employee Directory</h1>
        </div>
        <div className="page-actions">
          <AppButton variant="secondary" onClick={() => setCreateOpen(true)}>➕ Tambah Slip Baru</AppButton>
          <AppButton onClick={() => setAddOpen(true)}>➕ Tambah Karyawan</AppButton>
        </div>
      </div>

      <section className="section-block">
        <AppCard title="Active employees">
          <AppTable
            columns={[
              { label: '#', key: 'id' },
              { label: 'Nama', key: 'name' },
              { label: 'Jabatan', key: 'position' },
              { label: 'Departemen', key: 'department' },
              { label: 'Gaji Pokok', key: 'baseSalary', render: (row) => row.baseSalary.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) },
            ]}
            data={employees}
            emptyText="Belum ada karyawan"
          />
        </AppCard>
      </section>

      <AppModal open={addOpen} title="Tambah Karyawan Baru" onClose={() => setAddOpen(false)}>
        <div className="form-grid" style={{ gap: '16px' }}>
          <AppInput label="Nama" value={newEmployee.name} onChange={(e) => handleNewEmployeeChange('name', e.target.value)} placeholder="Nama karyawan" />
          <AppInput label="Jabatan" value={newEmployee.position} onChange={(e) => handleNewEmployeeChange('position', e.target.value)} placeholder="Jabatan" />
          <AppInput label="Departemen" value={newEmployee.department} onChange={(e) => handleNewEmployeeChange('department', e.target.value)} placeholder="Departemen" />
          <AppInput label="Gaji Pokok" type="number" inputMode="numeric" value={newEmployee.baseSalary} onChange={(e) => handleNewEmployeeChange('baseSalary', Number(e.target.value) || 0)} placeholder="0" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <AppButton variant="secondary" onClick={() => setAddOpen(false)}>Batal</AppButton>
            <AppButton onClick={handleSaveNewEmployee}>Simpan</AppButton>
          </div>
        </div>
      </AppModal>

      <AppModal open={createOpen} title="Tambah Slip Baru" onClose={() => setCreateOpen(false)}>
        <div className="form-grid" style={{ gap: '16px' }}>
          <label className="app-input">
            <span className="app-input-label">Pilih Karyawan</span>
            <select
              className="app-input-field"
              value={selectedEmployeeId || ''}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} — {employee.position}
                </option>
              ))}
            </select>
          </label>
          <AppInput label="Periode Slip" value={slipPeriod} onChange={(e) => setSlipPeriod(e.target.value)} placeholder="Mei 2026" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <AppButton variant="secondary" onClick={() => setCreateOpen(false)}>Batal</AppButton>
            <AppButton onClick={handleCreateSlip}>Buat Slip</AppButton>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
