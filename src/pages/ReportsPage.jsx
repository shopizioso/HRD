import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import '../styles/ReportsPage.css';

const ReportsPage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  
  const [reportType, setReportType] = useState('payroll');
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [department, setDepartment] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data for reports
  const mockPayrollData = [
    {
      employee: 'Viona Nur Alifah',
      position: 'Admin Marketplace',
      department: 'Marketplace',
      baseSalary: 2500000,
      allowance: 500000,
      deduction: 250000,
      total: 2750000,
    },
    {
      employee: 'Maulia Nissalati S',
      position: 'Admin Marketplace',
      department: 'Marketplace',
      baseSalary: 2500000,
      allowance: 500000,
      deduction: 250000,
      total: 2750000,
    },
    {
      employee: 'Hana Maria Ulfa',
      position: 'Admin Marketplace',
      department: 'Marketplace',
      baseSalary: 3000000,
      allowance: 600000,
      deduction: 300000,
      total: 3300000,
    },
    {
      employee: 'Apit Purnomo',
      position: 'Accounting',
      department: 'Finance & Accounting',
      baseSalary: 6000000,
      allowance: 1200000,
      deduction: 600000,
      total: 6600000,
    },
    {
      employee: 'Shopi Setiawan',
      position: 'Manager',
      department: 'Operations & Fulfillment',
      baseSalary: 10000000,
      allowance: 2000000,
      deduction: 1000000,
      total: 11000000,
    },
  ];

  const mockDepartmentData = [
    {
      department: 'Marketplace',
      employees: 5,
      totalSalary: 14520000,
      totalAllowance: 2900000,
      totalDeduction: 1450000,
      totalExpense: 15970000,
    },
    {
      department: 'Finance & Accounting',
      employees: 1,
      totalSalary: 6000000,
      totalAllowance: 1200000,
      totalDeduction: 600000,
      totalExpense: 6600000,
    },
    {
      department: 'Operations & Fulfillment',
      employees: 1,
      totalSalary: 10000000,
      totalAllowance: 2000000,
      totalDeduction: 1000000,
      totalExpense: 11000000,
    },
  ];

  const mockTaxData = [
    {
      employee: 'Viona Nur Alifah',
      baseSalary: 2500000,
      taxableIncome: 2750000,
      pph21: 165000,
      bpjs: 116350,
      totalDeduction: 281350,
    },
    {
      employee: 'Apit Purnomo',
      baseSalary: 6000000,
      taxableIncome: 6600000,
      pph21: 396000,
      bpjs: 279216,
      totalDeduction: 675216,
    },
    {
      employee: 'Shopi Setiawan',
      baseSalary: 10000000,
      taxableIncome: 11000000,
      pph21: 660000,
      bpjs: 465360,
      totalDeduction: 1125360,
    },
  ];

  const generateReport = () => {
    setLoading(true);
    
    setTimeout(() => {
      let data = null;
      
      if (reportType === 'payroll') {
        data = {
          type: 'Payroll Report',
          month: new Date(monthYear + '-01').toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric'
          }),
          totalEmployees: mockPayrollData.length,
          totalSalary: 23500000,
          totalAllowance: 4700000,
          totalDeduction: 2350000,
          totalPayment: 25850000,
          employees: mockPayrollData,
        };
      } else if (reportType === 'department') {
        data = {
          type: 'Department Report',
          month: new Date(monthYear + '-01').toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric'
          }),
          totalDepartments: mockDepartmentData.length,
          totalExpense: 33570000,
          departments: mockDepartmentData,
        };
      } else if (reportType === 'tax') {
        data = {
          type: 'Tax Report (PPh 21 & BPJS)',
          month: new Date(monthYear + '-01').toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric'
          }),
          totalEmployees: mockTaxData.length,
          totalTax: 1221000,
          totalBPJS: 860926,
          totalDeduction: 2081926,
          employees: mockTaxData,
        };
      }
      
      setReportData(data);
      setLoading(false);
      addToast('Report generated successfully', 'success');
    }, 800);
  };

  const exportReport = (format) => {
    if (!reportData) return;

    try {
      if (format === 'csv') {
        let csv = '';
        
        if (reportType === 'payroll') {
          csv = 'Employee,Position,Department,Base Salary,Allowance,Deduction,Total\n';
          reportData.employees.forEach(emp => {
            csv += `"${emp.employee}","${emp.position}","${emp.department}",${emp.baseSalary},${emp.allowance},${emp.deduction},${emp.total}\n`;
          });
        } else if (reportType === 'department') {
          csv = 'Department,Employees,Total Salary,Total Allowance,Total Deduction,Total Expense\n';
          reportData.departments.forEach(dept => {
            csv += `"${dept.department}",${dept.employees},${dept.totalSalary},${dept.totalAllowance},${dept.totalDeduction},${dept.totalExpense}\n`;
          });
        }
        
        downloadFile(csv, `${reportType}-report-${monthYear}.csv`, 'text/csv');
        addToast('Report exported as CSV', 'success');
      } else if (format === 'json') {
        const json = JSON.stringify(reportData, null, 2);
        downloadFile(json, `${reportType}-report-${monthYear}.json`, 'application/json');
        addToast('Report exported as JSON', 'success');
      }
    } catch (err) {
      addToast('Failed to export report', 'error');
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>📊 Reports</h1>
        <p>Generate comprehensive payroll, department, and tax reports</p>
      </div>

      <div className="reports-container">
        <div className="reports-sidebar">
          <div className="filter-section">
            <h3>Generate Report</h3>
            
            <div className="filter-group">
              <label>Report Type</label>
              <select 
                value={reportType} 
                onChange={(e) => {
                  setReportType(e.target.value);
                  setReportData(null);
                }}
                className="filter-select"
              >
                <option value="payroll">📈 Payroll Report</option>
                <option value="department">🏢 Department Report</option>
                <option value="tax">💰 Tax Report (PPh 21 & BPJS)</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Month & Year</label>
              <input 
                type="month" 
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="filter-input"
              />
            </div>

            {reportType === 'payroll' && (
              <div className="filter-group">
                <label>Department Filter</label>
                <select 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Departments</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="finance">Finance & Accounting</option>
                  <option value="operations">Operations & Fulfillment</option>
                </select>
              </div>
            )}

            <AppButton 
              onClick={generateReport}
              variant="primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? '⏳ Generating...' : '🔄 Generate Report'}
            </AppButton>
          </div>

          {reportData && (
            <div className="export-section">
              <h3>Export Options</h3>
              <AppButton 
                onClick={() => exportReport('csv')}
                variant="secondary"
                style={{ width: '100%', marginBottom: '10px' }}
              >
                📥 Download CSV
              </AppButton>
              <AppButton 
                onClick={() => exportReport('json')}
                variant="secondary"
                style={{ width: '100%' }}
              >
                📥 Download JSON
              </AppButton>
            </div>
          )}
        </div>

        <div className="reports-content">
          {!reportData ? (
            <div className="reports-empty">
              <div className="empty-icon">📋</div>
              <h2>No Report Generated</h2>
              <p>Select report type and click "Generate Report" to view data</p>
            </div>
          ) : (
            <div className="report-display">
              <div className="report-header-info">
                <div>
                  <h2>{reportData.type}</h2>
                  <p className="report-period">Period: {reportData.month}</p>
                </div>
              </div>

              {/* Payroll Report */}
              {reportType === 'payroll' && (
                <div className="report-section">
                  <div className="report-summary">
                    <div className="summary-card">
                      <span className="summary-label">Total Employees</span>
                      <span className="summary-value">{reportData.totalEmployees}</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Total Salary</span>
                      <span className="summary-value">{formatCurrency(reportData.totalSalary)}</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Total Allowance</span>
                      <span className="summary-value">{formatCurrency(reportData.totalAllowance)}</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Total Deduction</span>
                      <span className="summary-value">{formatCurrency(reportData.totalDeduction)}</span>
                    </div>
                    <div className="summary-card highlight">
                      <span className="summary-label">Total Payment</span>
                      <span className="summary-value">{formatCurrency(reportData.totalPayment)}</span>
                    </div>
                  </div>

                  <div className="report-table-wrapper">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Position</th>
                          <th>Department</th>
                          <th className="amount">Base Salary</th>
                          <th className="amount">Allowance</th>
                          <th className="amount">Deduction</th>
                          <th className="amount highlight">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.employees.map((emp, idx) => (
                          <tr key={idx}>
                            <td>{emp.employee}</td>
                            <td>{emp.position}</td>
                            <td>{emp.department}</td>
                            <td className="amount">{formatCurrency(emp.baseSalary)}</td>
                            <td className="amount">{formatCurrency(emp.allowance)}</td>
                            <td className="amount">{formatCurrency(emp.deduction)}</td>
                            <td className="amount highlight">{formatCurrency(emp.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Department Report */}
              {reportType === 'department' && (
                <div className="report-section">
                  <div className="report-summary">
                    <div className="summary-card">
                      <span className="summary-label">Total Departments</span>
                      <span className="summary-value">{reportData.totalDepartments}</span>
                    </div>
                    <div className="summary-card highlight">
                      <span className="summary-label">Total Expense</span>
                      <span className="summary-value">{formatCurrency(reportData.totalExpense)}</span>
                    </div>
                  </div>

                  <div className="report-table-wrapper">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Department</th>
                          <th className="amount">Employees</th>
                          <th className="amount">Total Salary</th>
                          <th className="amount">Total Allowance</th>
                          <th className="amount">Total Deduction</th>
                          <th className="amount highlight">Total Expense</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.departments.map((dept, idx) => (
                          <tr key={idx}>
                            <td>{dept.department}</td>
                            <td className="amount">{dept.employees}</td>
                            <td className="amount">{formatCurrency(dept.totalSalary)}</td>
                            <td className="amount">{formatCurrency(dept.totalAllowance)}</td>
                            <td className="amount">{formatCurrency(dept.totalDeduction)}</td>
                            <td className="amount highlight">{formatCurrency(dept.totalExpense)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tax Report */}
              {reportType === 'tax' && (
                <div className="report-section">
                  <div className="report-summary">
                    <div className="summary-card">
                      <span className="summary-label">Total Employees</span>
                      <span className="summary-value">{reportData.totalEmployees}</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Total PPh 21</span>
                      <span className="summary-value">{formatCurrency(reportData.totalTax)}</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Total BPJS</span>
                      <span className="summary-value">{formatCurrency(reportData.totalBPJS)}</span>
                    </div>
                    <div className="summary-card highlight">
                      <span className="summary-label">Total Deduction</span>
                      <span className="summary-value">{formatCurrency(reportData.totalDeduction)}</span>
                    </div>
                  </div>

                  <div className="report-table-wrapper">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th className="amount">Taxable Income</th>
                          <th className="amount">PPh 21</th>
                          <th className="amount">BPJS</th>
                          <th className="amount highlight">Total Tax</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.employees.map((emp, idx) => (
                          <tr key={idx}>
                            <td>{emp.employee}</td>
                            <td className="amount">{formatCurrency(emp.taxableIncome)}</td>
                            <td className="amount">{formatCurrency(emp.pph21)}</td>
                            <td className="amount">{formatCurrency(emp.bpjs)}</td>
                            <td className="amount highlight">{formatCurrency(emp.totalDeduction)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
