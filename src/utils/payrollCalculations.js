// Payroll Calculation Engine
// Implements Indonesian payroll regulations

export const PAYROLL_CONFIG = {
  // Tax rates & deductions
  pphRate: 0.05, // 5% PPh 21 (simplified - actual depends on tax bracket)
  bpjsRate: 0.0424, // 4.24% BPJS Kesehatan (employer)
  bpjsEmployeeRate: 0.01, // 1% BPJS Ketenagakerjaan (employee)
  
  // Limits
  bpjsMaxDaily: 280000,
  bpjsMinDaily: 1000,
  pphMinIncome: 4500000, // Annual threshold
};

/**
 * Calculate gross salary (total income)
 */
export function calculateGross(salary) {
  const base = salary.baseSalary || 0;
  const allowance = salary.allowance || 0;
  const bonus = salary.bonus || 0;
  const overtime = salary.overtime || 0;
  
  return base + allowance + bonus + overtime;
}

/**
 * Calculate BPJS contribution
 */
export function calculateBPJS(grossSalary) {
  const daily = grossSalary / 22; // Average working days
  const capped = Math.min(daily, PAYROLL_CONFIG.bpjsMaxDaily);
  const employee = capped * PAYROLL_CONFIG.bpjsEmployeeRate;
  const employer = capped * PAYROLL_CONFIG.bpjsRate;
  
  return {
    employee: Math.round(employee),
    employer: Math.round(employer),
    total: Math.round(employee + employer),
  };
}

/**
 * Calculate PPh 21 (Indonesian personal tax)
 * Simplified version - actual calculation is more complex
 */
export function calculatePPh(grossSalary, dependents = 0) {
  // Simplified: using monthly calculation
  const annual = grossSalary * 12;
  
  // Tax brackets (simplified)
  if (annual <= PAYROLL_CONFIG.pphMinIncome) {
    return 0;
  }
  
  const taxableIncome = annual - PAYROLL_CONFIG.pphMinIncome;
  let tax = 0;
  
  // Indonesian tax brackets (simplified)
  if (taxableIncome > 500000000) {
    tax = (taxableIncome - 500000000) * 0.30 + 
          150000000 * 0.25 + 
          100000000 * 0.20 + 
          50000000 * 0.15;
  } else if (taxableIncome > 250000000) {
    tax = (taxableIncome - 250000000) * 0.25 + 
          100000000 * 0.20 + 
          50000000 * 0.15;
  } else if (taxableIncome > 100000000) {
    tax = (taxableIncome - 100000000) * 0.20 + 50000000 * 0.15;
  } else if (taxableIncome > 50000000) {
    tax = taxableIncome * 0.15;
  }
  
  const monthlyTax = Math.round(tax / 12);
  return Math.max(0, monthlyTax);
}

/**
 * Calculate total deductions
 */
export function calculateDeductions(salary) {
  const gross = calculateGross(salary);
  const bpjs = calculateBPJS(gross);
  const pph = calculatePPh(gross);
  
  const custom = {
    bpjs: salary.bpjs || 0,
    tax: salary.tax || pph,
    other: salary.otherDeduction || 0,
  };
  
  const total = custom.bpjs + custom.tax + custom.other;
  
  return {
    bpjs: custom.bpjs,
    tax: custom.tax,
    other: custom.other,
    total,
    breakdown: {
      bpjs: `BPJS: Rp ${formatCurrency(custom.bpjs)}`,
      tax: `Pajak: Rp ${formatCurrency(custom.tax)}`,
      other: `Potongan Lain: Rp ${formatCurrency(custom.other)}`,
    },
  };
}

/**
 * Calculate net salary (take-home)
 */
export function calculateNet(salary) {
  const gross = calculateGross(salary);
  const deductions = calculateDeductions(salary);
  const net = gross - deductions.total;
  
  return Math.max(0, net);
}

/**
 * Generate complete payroll calculation
 */
export function calculatePayroll(salary) {
  const gross = calculateGross(salary);
  const deductions = calculateDeductions(salary);
  const net = calculateNet(salary);
  
  return {
    income: {
      base: salary.baseSalary || 0,
      allowance: salary.allowance || 0,
      bonus: salary.bonus || 0,
      overtime: salary.overtime || 0,
      gross,
    },
    deductions: {
      bpjs: deductions.bpjs,
      tax: deductions.tax,
      other: deductions.other,
      total: deductions.total,
    },
    net,
    percentage: {
      deductionRate: gross > 0 ? (deductions.total / gross * 100).toFixed(2) : 0,
      netRate: gross > 0 ? (net / gross * 100).toFixed(2) : 0,
    },
  };
}

/**
 * Format currency to IDR
 */
export function formatCurrency(amount) {
  if (!amount || amount === 0) return '0';
  return amount.toLocaleString('id-ID');
}

/**
 * Parse currency string to number
 */
export function parseCurrency(str) {
  if (!str) return 0;
  return parseInt(str.replace(/\D/g, ''), 10) || 0;
}

/**
 * Generate payroll summary for multiple employees
 */
export function generatePayrollSummary(employees) {
  const summary = employees.reduce((acc, emp) => {
    const calc = calculatePayroll(emp);
    
    return {
      totalGross: (acc.totalGross || 0) + calc.income.gross,
      totalDeductions: (acc.totalDeductions || 0) + calc.deductions.total,
      totalNet: (acc.totalNet || 0) + calc.net,
      byDepartment: {
        ...acc.byDepartment,
        [emp.department]: (acc.byDepartment?.[emp.department] || 0) + calc.net,
      },
      employeeCount: (acc.employeeCount || 0) + 1,
    };
  }, {});
  
  return {
    ...summary,
    averageGross: summary.totalGross / summary.employeeCount,
    averageNet: summary.totalNet / summary.employeeCount,
  };
}
