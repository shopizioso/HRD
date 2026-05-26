/**
 * Utility untuk sinkronisasi data antara Setup dan Financial pages
 */

// Import income management functions
import { getIncomeEntries as getIncomeEntriesAPI } from './incomeAPI.js';

export const getSetupData = () => {
  const saved = localStorage.getItem('setupData');
  return saved ? JSON.parse(saved) : null;
};

export const calculateFinancialMetrics = () => {
  const setupData = getSetupData();
  if (!setupData) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
      cashBalance: 0,
      lastMonth: { income: 0, expense: 0 }
    };
  }

  // Calculate total expenses dari operational expenses
  let totalExpense = 0;
  
  // Add operational expenses (check both possible locations)
  const opExpenses = setupData.expense?.operationalExpenses || setupData.operationalExpenses || [];
  if (Array.isArray(opExpenses)) {
    totalExpense += opExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }

  // Calculate dari capital/saldo awal
  const capitalData = setupData.capital || {};
  const cashBalance = (capitalData.cashInitial || 0) + 
                      (capitalData.bankInitial || 0) + 
                      Object.values(capitalData.banks || {}).reduce((sum, b) => sum + (b.balance || 0), 0);

  const totalIncome = (capitalData.totalIncome || 0);
  const netProfit = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    netProfit,
    cashBalance,
    lastMonth: { income: 0, expense: 0 }
  };
};

export const getProfitLossData = () => {
  const setupData = getSetupData();
  if (!setupData) {
    return {
      incomeData: { shopee: 0, tokopedia: 0, tiktok: 0, website: 0, other: 0 },
      expenseData: {
        salaries: 0, advertising: 0, marketplaceFee: 0, hosting: 0,
        tools: 0, transport: 0, bonus: 0, operational: 0,
      }
    };
  }

  // Build income from marketplaces
  const incomeData = {
    shopee: 0,
    tokopedia: 0,
    tiktok: 0,
    website: 0,
    other: 0,
  };

  if (setupData.marketplaces && Array.isArray(setupData.marketplaces)) {
    setupData.marketplaces.forEach(mp => {
      const name = mp.name ? mp.name.toLowerCase() : '';
      if (name.includes('shopee')) incomeData.shopee = mp.balance || 0;
      else if (name.includes('tokopedia')) incomeData.tokopedia = mp.balance || 0;
      else if (name.includes('tiktok')) incomeData.tiktok = mp.balance || 0;
      else if (name.includes('website')) incomeData.website = mp.balance || 0;
      else incomeData.other += mp.balance || 0;
    });
  }

  // Build expenses from expense data
  const expenseData = {
    salaries: 0,
    advertising: 0,
    marketplaceFee: 0,
    hosting: 0,
    tools: 0,
    transport: 0,
    bonus: 0,
    operational: 0,
  };

  if (setupData.expenses && Array.isArray(setupData.expenses)) {
    setupData.expenses.forEach(exp => {
      const name = exp.name ? exp.name.toLowerCase() : '';
      if (name.includes('gaji') || name.includes('salary')) expenseData.salaries += exp.amount || 0;
      else if (name.includes('iklan') || name.includes('advertising')) expenseData.advertising += exp.amount || 0;
      else if (name.includes('fee') || name.includes('komisi')) expenseData.marketplaceFee += exp.amount || 0;
      else if (name.includes('hosting')) expenseData.hosting += exp.amount || 0;
      else if (name.includes('tools')) expenseData.tools += exp.amount || 0;
      else if (name.includes('transport') || name.includes('kendaraan')) expenseData.transport += exp.amount || 0;
      else if (name.includes('bonus')) expenseData.bonus += exp.amount || 0;
      else expenseData.operational += exp.amount || 0;
    });
  }

  // Add operational expenses (check both possible locations)
  const opExpenses = setupData.expense?.operationalExpenses || setupData.operationalExpenses || [];
  if (Array.isArray(opExpenses)) {
    opExpenses.forEach(opExp => {
      expenseData.operational += opExp.amount || 0;
    });
  }

  return { incomeData, expenseData };
};

export const getBalanceSheetData = () => {
  const setupData = getSetupData();
  if (!setupData) {
    return {
      assets: { currentAssets: {}, fixedAssets: {} },
      liabilities: { currentLiabilities: {}, longTermLiabilities: {} },
      equity: { capital: 0, retainedEarnings: 0 }
    };
  }

  const capitalData = setupData.capital || {};
  
  // Assets
  const assets = {
    currentAssets: {
      cash: capitalData.cashInitial || 0,
      bankAccount: capitalData.bankInitial || 0,
      accountsReceivable: capitalData.receivables || 0,
      inventory: capitalData.inventory || 0,
      prepaidExpenses: capitalData.prepaid || 0,
    },
    fixedAssets: {
      equipment: capitalData.equipment || 0,
      accumulatedDepreciation: capitalData.depreciationEquipment || 0,
      vehicles: capitalData.vehicles || 0,
      accumulatedDepVehicles: capitalData.depreciationVehicles || 0,
    },
  };

  // Liabilities
  const liabilities = {
    currentLiabilities: {
      accountsPayable: 0,
      shortTermLoans: 0,
      dueInvoices: 0,
    },
    longTermLiabilities: {
      longTermLoans: 0,
      deferredTaxes: 0,
    },
  };

  if (setupData.liabilities && Array.isArray(setupData.liabilities)) {
    setupData.liabilities.forEach(liability => {
      if (liability.type === 'Hutang Usaha') liabilities.currentLiabilities.accountsPayable += liability.amount || 0;
      else if (liability.type === 'Hutang Gaji') liabilities.currentLiabilities.shortTermLoans += liability.amount || 0;
      else if (liability.type === 'Pinjaman Pendek') liabilities.currentLiabilities.shortTermLoans += liability.amount || 0;
      else if (liability.type === 'Pinjaman Panjang') liabilities.longTermLiabilities.longTermLoans += liability.amount || 0;
      else liabilities.currentLiabilities.dueInvoices += liability.amount || 0;
    });
  }

  // Equity
  const equity = {
    capital: capitalData.capital || 0,
    retainedEarnings: 0,
  };

  return { assets, liabilities, equity };
};

export const getMarketplaceData = () => {
  const setupData = getSetupData();
  if (!setupData || !setupData.marketplaces) {
    return {
      shopee: { name: 'Shopee', icon: '🛒', totalSales: 0, totalOrders: 0, commission: 0, refunds: 0, netIncome: 0, avgOrderValue: 0, topProduct: '-' },
      tokopedia: { name: 'Tokopedia', icon: '🏪', totalSales: 0, totalOrders: 0, commission: 0, refunds: 0, netIncome: 0, avgOrderValue: 0, topProduct: '-' },
      tiktok: { name: 'TikTok Shop', icon: '🎵', totalSales: 0, totalOrders: 0, commission: 0, refunds: 0, netIncome: 0, avgOrderValue: 0, topProduct: '-' },
      website: { name: 'Website Sendiri', icon: '🌐', totalSales: 0, totalOrders: 0, commission: 0, refunds: 0, netIncome: 0, avgOrderValue: 0, topProduct: '-' },
      other: { name: 'Lainnya', icon: '📦', totalSales: 0, totalOrders: 0, commission: 0, refunds: 0, netIncome: 0, avgOrderValue: 0, topProduct: '-' },
    };
  }

  const marketplaceData = {
    shopee: { name: 'Shopee', icon: '🛒', totalSales: 0, totalOrders: 0, commission: 0, refunds: 0, netIncome: 0, avgOrderValue: 0, topProduct: '-' },
    tokopedia: { name: 'Tokopedia', icon: '🏪', totalSales: 0, totalOrders: 0, commission: 0, refunds: 0, netIncome: 0, avgOrderValue: 0, topProduct: '-' },
    tiktok: { name: 'TikTok Shop', icon: '🎵', totalSales: 0, totalOrders: 0, commission: 0, refunds: 0, netIncome: 0, avgOrderValue: 0, topProduct: '-' },
    website: { name: 'Website Sendiri', icon: '🌐', totalSales: 0, totalOrders: 0, commission: 0, refunds: 0, netIncome: 0, avgOrderValue: 0, topProduct: '-' },
    other: { name: 'Lainnya', icon: '📦', totalSales: 0, totalOrders: 0, commission: 0, refunds: 0, netIncome: 0, avgOrderValue: 0, topProduct: '-' },
  };

  setupData.marketplaces.forEach(mp => {
    const key = mp.name ? mp.name.toLowerCase().replace(/\s+/g, '') : 'other';
    const commission = (mp.initialBalance || 0) * ((mp.commissionRate || 0) / 100);
    
    if (key.includes('shopee')) {
      marketplaceData.shopee = {
        ...marketplaceData.shopee,
        totalSales: mp.initialBalance || 0,
        commission: commission,
        netIncome: (mp.initialBalance || 0) - commission,
      };
    } else if (key.includes('tokopedia')) {
      marketplaceData.tokopedia = {
        ...marketplaceData.tokopedia,
        totalSales: mp.initialBalance || 0,
        commission: commission,
        netIncome: (mp.initialBalance || 0) - commission,
      };
    } else if (key.includes('tiktok')) {
      marketplaceData.tiktok = {
        ...marketplaceData.tiktok,
        totalSales: mp.initialBalance || 0,
        commission: commission,
        netIncome: (mp.initialBalance || 0) - commission,
      };
    } else if (key.includes('website')) {
      marketplaceData.website = {
        ...marketplaceData.website,
        totalSales: mp.initialBalance || 0,
        commission: 0,
        netIncome: mp.initialBalance || 0,
      };
    } else {
      marketplaceData.other = {
        ...marketplaceData.other,
        totalSales: (marketplaceData.other.totalSales || 0) + (mp.initialBalance || 0),
        commission: (marketplaceData.other.commission || 0) + commission,
        netIncome: (marketplaceData.other.netIncome || 0) + ((mp.initialBalance || 0) - commission),
      };
    }
  });

  return marketplaceData;
};

/**
 * Get income data dari income entries
 * Returns promise yang resolve dengan income summary
 */
export const getIncomeData = async () => {
  try {
    const entries = await getIncomeEntriesAPI();
    
    const incomeByMarketplace = {
      shopee: 0,
      tokopedia: 0,
      tiktok: 0,
      lazada: 0,
      website: 0,
      other: 0,
    };

    let totalIncome = 0;
    let totalCommission = 0;
    let totalOrders = 0;

    entries.forEach(entry => {
      const marketplace = entry.marketplace || 'other';
      incomeByMarketplace[marketplace] = (incomeByMarketplace[marketplace] || 0) + (entry.amount || 0);
      totalIncome += entry.amount || 0;
      totalCommission += entry.commission || 0;
      totalOrders += entry.orders || 0;
    });

    return {
      incomeByMarketplace,
      totalIncome,
      totalCommission,
      netIncome: totalIncome - totalCommission,
      totalOrders,
      transactionCount: entries.length,
    };
  } catch (error) {
    console.error('Error getting income data:', error);
    return {
      incomeByMarketplace: { shopee: 0, tokopedia: 0, tiktok: 0, lazada: 0, website: 0, other: 0 },
      totalIncome: 0,
      totalCommission: 0,
      netIncome: 0,
      totalOrders: 0,
      transactionCount: 0,
    };
  }
};

/**
 * Calculate financial metrics termasuk income dari income records
 */
export const calculateFinancialMetricsWithIncome = async () => {
  const metrics = calculateFinancialMetrics();
  const incomeData = await getIncomeData();

  return {
    ...metrics,
    incomeData,
    totalIncome: metrics.totalIncome + incomeData.totalIncome,
    totalCommission: incomeData.totalCommission,
    netProfit: (metrics.totalIncome + incomeData.totalIncome) - (metrics.totalExpense + incomeData.totalCommission),
  };
};
