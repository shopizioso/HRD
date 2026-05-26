/**
 * Commission & Bonus Calculation Utility
 * Auto-calculate commission untuk karyawan based on income
 */

export const COMMISSION_RULES = {
  tiered: {
    name: 'Berjenjang',
    tiers: [
      { min: 0, max: 10000000, percentage: 1 },
      { min: 10000001, max: 50000000, percentage: 1.5 },
      { min: 50000001, max: Infinity, percentage: 2 },
    ]
  },
  fixed: {
    name: 'Tetap',
    percentage: 1.5
  },
  performance: {
    name: 'Performa',
    basePercentage: 1,
    bonusPercentage: 0.5,
    targetOrders: 100
  }
};

export const calculateCommission = (income, rule = 'tiered', args = {}) => {
  if (rule === 'tiered') {
    const tiers = args.tiers || COMMISSION_RULES.tiered.tiers;
    const tier = tiers.find(t => income >= t.min && income <= t.max);
    return tier ? (income * tier.percentage) / 100 : 0;
  } else if (rule === 'fixed') {
    const percentage = args.percentage || COMMISSION_RULES.fixed.percentage;
    return (income * percentage) / 100;
  } else if (rule === 'performance') {
    const basePercentage = args.basePercentage || 1;
    const bonusPercentage = args.bonusPercentage || 0.5;
    const targetOrders = args.targetOrders || 100;
    const orders = args.orders || 0;
    
    let commission = (income * basePercentage) / 100;
    if (orders >= targetOrders) {
      commission += (income * bonusPercentage) / 100;
    }
    return commission;
  }
  return 0;
};

export const calculateEmployeeBonus = (incomeData, employeeId, config = {}) => {
  const {
    salaryMultiplier = 0.05,
    targetMultiplier = 1.1,
    topPerformerBonus = 2000000
  } = config;

  const employee = incomeData.employees?.find(e => e.id === employeeId);
  if (!employee) return 0;

  let bonus = employee.baseSalary * salaryMultiplier;

  // Performance bonus
  if (incomeData.performance?.[employeeId]?.achievementRate >= targetMultiplier) {
    bonus += topPerformerBonus;
  }

  return bonus;
};

export const getEmployeeCommissionReport = (entries, employeeAssignments) => {
  const report = {};

  Object.entries(employeeAssignments).forEach(([employeeId, config]) => {
    const employeeEntries = entries.filter(e => {
      if (config.marketplaces?.length > 0) {
        return config.marketplaces.includes(e.marketplace);
      }
      return true;
    });

    const totalIncome = employeeEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalOrders = employeeEntries.reduce((sum, e) => sum + (e.orders || 0), 0);

    const commission = calculateCommission(totalIncome, config.rule || 'tiered', {
      ...config,
      orders: totalOrders
    });

    report[employeeId] = {
      income: totalIncome,
      orders: totalOrders,
      commission,
      transactions: employeeEntries.length,
      average: totalIncome / Math.max(employeeEntries.length, 1)
    };
  });

  return report;
};

export const generatePayrollIntegration = (commissionReport, payroll) => {
  const updated = { ...payroll };

  Object.entries(commissionReport).forEach(([employeeId, data]) => {
    if (updated[employeeId]) {
      updated[employeeId].commission = data.commission;
      updated[employeeId].commissionSource = 'auto-calculated-from-income';
      updated[employeeId].calculatedAt = new Date().toISOString();
    }
  });

  return updated;
};

export const syncIncomeToPayroll = async (month, year, employeeAssignments) => {
  try {
    // Get income entries for the month
    const entries = JSON.parse(localStorage.getItem('incomeEntries') || '[]');
    const monthStr = String(month).padStart(2, '0');
    const monthEntries = entries.filter(e => e.date.startsWith(`${year}-${monthStr}`));

    // Calculate commission for each employee
    const report = getEmployeeCommissionReport(monthEntries, employeeAssignments);

    // Get current payroll
    const payroll = JSON.parse(localStorage.getItem('payrollData') || '{}');

    // Update payroll with commission
    const updated = generatePayrollIntegration(report, payroll);

    // Save updated payroll
    localStorage.setItem('payrollData', JSON.stringify(updated));

    return {
      success: true,
      report,
      message: `Commission synced untuk ${Object.keys(report).length} karyawan`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
