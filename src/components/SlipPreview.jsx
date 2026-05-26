const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function SlipPreview({ company, employee, slip }) {
  const gross = Number(employee.baseSalary || 0) + Number(employee.allowance || 0) + Number(employee.bonus || 0) + Number(employee.overtime || 0);
  const totalDeductions = Number(employee.bpjs || 0) + Number(employee.tax || 0) + Number(employee.otherDeduction || 0);
  const net = gross - totalDeductions;

  return (
    <article className="slip-preview">
      <div className="slip-header slip-header-brand">
        <div className="slip-brand">
          <div className="slip-logo-block">
            {company.logo ? (
              <img src={company.logo} alt="Company logo" className="slip-logo-preview" />
            ) : (
              <div className="slip-logo-empty">LOGO</div>
            )}
          </div>
          <div>
            <p className="slip-company-name">{company.name}</p>
            <p className="slip-company-email">{company.email}</p>
          </div>
        </div>

        <div className="slip-badge">Slip Gaji</div>
      </div>

      <div className="slip-grid slip-summary-grid">
        <div>
          <p className="slip-label">Nomor slip</p>
          <p className="slip-value">{slip.number}</p>
        </div>
        <div>
          <p className="slip-label">Periode</p>
          <p className="slip-value">{slip.period}</p>
        </div>
        <div>
          <p className="slip-label">Nama karyawan</p>
          <p className="slip-value">{employee.name}</p>
        </div>
        <div>
          <p className="slip-label">Departemen</p>
          <p className="slip-value">{employee.department}</p>
        </div>
        <div>
          <p className="slip-label">Jabatan</p>
          <p className="slip-value">{employee.position}</p>
        </div>
        <div>
          <p className="slip-label">Hari hadir</p>
          <p className="slip-value">{slip.presentDays}</p>
        </div>
        <div>
          <p className="slip-label">Hari cuti</p>
          <p className="slip-value">{slip.leaveDays}</p>
        </div>
        <div>
          <p className="slip-label">Hari sakit</p>
          <p className="slip-value">{slip.sickDays}</p>
        </div>
      </div>

      <div className="slip-table">
        <div className="slip-table-header">
          <span>Pendapatan</span>
          <span>Jumlah</span>
        </div>
        <div className="slip-table-row"><span>Gaji pokok</span><span>{formatCurrency(employee.baseSalary)}</span></div>
        <div className="slip-table-row"><span>Tunjangan</span><span>{formatCurrency(employee.allowance)}</span></div>
        <div className="slip-table-row"><span>Bonus</span><span>{formatCurrency(employee.bonus)}</span></div>
        <div className="slip-table-row"><span>Lembur</span><span>{formatCurrency(employee.overtime)}</span></div>
        <div className="slip-table-row slip-table-summary"><span>Total Bruto</span><span>{formatCurrency(gross)}</span></div>
      </div>

      <div className="slip-table slip-table-deductions">
        <div className="slip-table-header">
          <span>Potongan</span>
          <span>Jumlah</span>
        </div>
        <div className="slip-table-row"><span>BPJS</span><span>{formatCurrency(employee.bpjs)}</span></div>
        <div className="slip-table-row"><span>Pajak</span><span>{formatCurrency(employee.tax)}</span></div>
        <div className="slip-table-row"><span>Potongan lain</span><span>{formatCurrency(employee.otherDeduction)}</span></div>
        <div className="slip-table-row slip-table-summary"><span>Total Potongan</span><span>{formatCurrency(totalDeductions)}</span></div>
      </div>

      <div className="slip-total-card">
        <div>
          <p className="slip-total-label">Take home pay</p>
          <p className="slip-total-value">{formatCurrency(net)}</p>
        </div>
      </div>

      <div className="slip-footer">
        <p>{slip.note}</p>
        <p>{slip.hrdName} • {slip.signature}</p>
      </div>
    </article>
  );
}
