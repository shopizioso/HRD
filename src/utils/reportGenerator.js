/**
 * Report Generation System
 * Creates professional payroll and HR reports
 */

import { calculatePayroll } from './payrollCalculations';

export class ReportGenerator {
  /**
   * Generate monthly payroll summary report
   */
  static generatePayrollReport(employees, month, year) {
    const reportDate = new Date(year, month - 1);
    const report = {
      title: `Laporan Penggajian ${reportDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
      generatedAt: new Date().toLocaleString('id-ID'),
      period: `${month}/${year}`,
      summary: {
        totalEmployees: employees.length,
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        averageGross: 0,
        averageNet: 0,
      },
      byDepartment: {},
      details: [],
    };

    // Calculate for each employee
    for (const emp of employees) {
      const calc = calculatePayroll(emp);
      const dept = emp.department || 'Undefined';

      // Add to summary
      report.summary.totalGross += calc.income.gross;
      report.summary.totalDeductions += calc.deductions.total;
      report.summary.totalNet += calc.net;

      // Add to department breakdown
      if (!report.byDepartment[dept]) {
        report.byDepartment[dept] = {
          employees: [],
          totalGross: 0,
          totalNet: 0,
          count: 0,
        };
      }

      report.byDepartment[dept].totalGross += calc.income.gross;
      report.byDepartment[dept].totalNet += calc.net;
      report.byDepartment[dept].count += 1;
      report.byDepartment[dept].employees.push({
        name: emp.name,
        position: emp.position,
        gross: calc.income.gross,
        deductions: calc.deductions.total,
        net: calc.net,
      });

      // Add to details
      report.details.push({
        employeeId: emp.id,
        name: emp.name,
        position: emp.position,
        department: dept,
        ...calc,
      });
    }

    // Calculate averages
    if (employees.length > 0) {
      report.summary.averageGross = report.summary.totalGross / employees.length;
      report.summary.averageNet = report.summary.totalNet / employees.length;
    }

    return report;
  }

  /**
   * Generate departmentwise salary report
   */
  static generateDepartmentReport(employees) {
    const byDept = {};

    for (const emp of employees) {
      const dept = emp.department || 'Undefined';
      const calc = calculatePayroll(emp);

      if (!byDept[dept]) {
        byDept[dept] = {
          employees: [],
          totalGross: 0,
          totalDeductions: 0,
          totalNet: 0,
          count: 0,
        };
      }

      byDept[dept].employees.push({
        ...emp,
        ...calc,
      });
      byDept[dept].totalGross += calc.income.gross;
      byDept[dept].totalDeductions += calc.deductions.total;
      byDept[dept].totalNet += calc.net;
      byDept[dept].count += 1;
    }

    return {
      title: 'Laporan Gaji Per Departemen',
      generatedAt: new Date().toLocaleString('id-ID'),
      departments: byDept,
      total: {
        departments: Object.keys(byDept).length,
        employees: employees.length,
        totalGross: Object.values(byDept).reduce((sum, d) => sum + d.totalGross, 0),
        totalDeductions: Object.values(byDept).reduce((sum, d) => sum + d.totalDeductions, 0),
        totalNet: Object.values(byDept).reduce((sum, d) => sum + d.totalNet, 0),
      },
    };
  }

  /**
   * Generate tax report (PPh 21)
   */
  static generateTaxReport(employees, month, year) {
    const taxItems = employees.map(emp => {
      const calc = calculatePayroll(emp);
      return {
        employeeId: emp.id,
        name: emp.name,
        grossSalary: calc.income.gross,
        tax: calc.deductions.tax,
        bpjs: calc.deductions.bpjs,
        totalDeductions: calc.deductions.total,
        netSalary: calc.net,
      };
    });

    const totalTax = taxItems.reduce((sum, item) => sum + item.tax, 0);
    const totalBPJS = taxItems.reduce((sum, item) => sum + item.bpjs, 0);

    return {
      title: `Laporan PPh 21 - ${month}/${year}`,
      generatedAt: new Date().toLocaleString('id-ID'),
      period: `${month}/${year}`,
      items: taxItems,
      summary: {
        totalEmployees: employees.length,
        totalPPh21: totalTax,
        totalBPJS: totalBPJS,
        totalDeductions: totalTax + totalBPJS,
      },
    };
  }

  /**
   * Export report as CSV
   */
  static exportReportAsCSV(report, filename = 'report.csv') {
    let csv = '';

    // Add title and metadata
    csv += `${report.title}\n`;
    csv += `Generated: ${report.generatedAt}\n\n`;

    if (report.summary) {
      csv += 'RINGKASAN\n';
      csv += Object.entries(report.summary)
        .map(([key, val]) => `${key},${val}`)
        .join('\n');
      csv += '\n\n';
    }

    // Add details table
    if (report.details) {
      csv += 'DETAIL PENGGAJIAN\n';
      csv += 'Nama,Posisi,Departemen,Gaji Pokok,Tunjangan,Bonus,Lembur,Total Bruto,BPJS,Pajak,Potongan Lain,Total Potongan,Take Home\n';

      for (const emp of report.details) {
        csv += `"${emp.name}","${emp.position}","${emp.department}",${emp.income.base},${emp.income.allowance},${emp.income.bonus},${emp.income.overtime},${emp.income.gross},${emp.deductions.bpjs},${emp.deductions.tax},${emp.deductions.other},${emp.deductions.total},${emp.net}\n`;
      }
    }

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export report as JSON
   */
  static exportReportAsJSON(report, filename = 'report.json') {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
