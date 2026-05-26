export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

export function calculatePayrollSummary(employees) {
  if (!employees || employees.length === 0) {
    return {
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      averageSalary: 0,
      count: 0
    };
  }

  const total = employees.reduce((acc, emp) => ({
    gross: acc.gross + (emp.gross_salary || 0),
    deductions: acc.deductions + (emp.bpjs + emp.pph_21 + emp.other_deductions || 0),
    net: acc.net + (emp.net_salary || 0)
  }), { gross: 0, deductions: 0, net: 0 });

  return {
    totalGross: total.gross,
    totalDeductions: total.deductions,
    totalNet: total.net,
    averageSalary: total.net / employees.length,
    count: employees.length
  };
}

export function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

export function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}
