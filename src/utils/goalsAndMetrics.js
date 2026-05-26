/**
 * Goals & Targets Management Utility
 */

export const getGoals = () => {
  const saved = localStorage.getItem('incomeGoals');
  return saved ? JSON.parse(saved) : [];
};

export const saveGoals = (goals) => {
  localStorage.setItem('incomeGoals', JSON.stringify(goals));
};

export const addGoal = (goal) => {
  const goals = getGoals();
  const newGoal = {
    id: Date.now(),
    ...goal,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  goals.push(newGoal);
  saveGoals(goals);
  return newGoal;
};

export const updateGoal = (id, updates) => {
  const goals = getGoals();
  const goal = goals.find(g => g.id === id);
  if (goal) {
    Object.assign(goal, updates);
    saveGoals(goals);
    return goal;
  }
  return null;
};

export const deleteGoal = (id) => {
  const goals = getGoals();
  const filtered = goals.filter(g => g.id !== id);
  saveGoals(filtered);
};

export const getGoalProgress = (goal, entries) => {
  let total = 0;
  
  if (goal.period === 'daily') {
    const today = new Date().toISOString().split('T')[0];
    total = entries
      .filter(e => e.date === today && (!goal.marketplace || e.marketplace === goal.marketplace))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  } else if (goal.period === 'weekly') {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekStartStr = weekStart.toISOString().split('T')[0];
    total = entries
      .filter(e => e.date >= weekStartStr && (!goal.marketplace || e.marketplace === goal.marketplace))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  } else if (goal.period === 'monthly') {
    const month = new Date().toISOString().slice(0, 7);
    total = entries
      .filter(e => e.date.startsWith(month) && (!goal.marketplace || e.marketplace === goal.marketplace))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }

  const percentage = Math.min((total / goal.target) * 100, 100);
  const remaining = Math.max(goal.target - total, 0);
  
  return {
    current: total,
    target: goal.target,
    percentage: Math.round(percentage),
    remaining,
    achieved: total >= goal.target,
  };
};

export const getComparison = async (entries) => {
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 7);

  const currentMonthEntries = entries.filter(e => e.date.startsWith(currentMonth));
  const lastMonthEntries = entries.filter(e => e.date.startsWith(lastMonth));

  const currentTotal = currentMonthEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const lastTotal = lastMonthEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

  const growth = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;
  const difference = currentTotal - lastTotal;

  // By marketplace
  const comparisonByMarketplace = {};
  
  ['shopee', 'tokopedia', 'tiktok', 'lazada', 'website', 'other'].forEach(mp => {
    const curr = currentMonthEntries
      .filter(e => e.marketplace === mp)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const last = lastMonthEntries
      .filter(e => e.marketplace === mp)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    comparisonByMarketplace[mp] = {
      current: curr,
      last: last,
      growth: last > 0 ? ((curr - last) / last) * 100 : 0,
      difference: curr - last,
    };
  });

  return {
    currentMonth,
    lastMonth,
    currentTotal,
    lastTotal,
    growth,
    difference,
    comparisonByMarketplace,
  };
};

export const getPerformanceKPI = (entries) => {
  const month = new Date().toISOString().slice(0, 7);
  const monthEntries = entries.filter(e => e.date.startsWith(month));

  const totalIncome = monthEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalCommission = monthEntries.reduce((sum, e) => sum + (e.commission || 0), 0);
  const totalOrders = monthEntries.reduce((sum, e) => sum + (e.orders || 0), 0);
  const conversionRate = monthEntries.length > 0 ? (totalOrders / monthEntries.length).toFixed(2) : 0;
  const aov = totalOrders > 0 ? totalIncome / totalOrders : 0;
  const commissionEfficiency = totalIncome > 0 ? ((totalIncome - totalCommission) / totalIncome) * 100 : 0;

  // Best performing marketplace
  const marketplacePerf = {};
  monthEntries.forEach(e => {
    if (!marketplacePerf[e.marketplace]) {
      marketplacePerf[e.marketplace] = { income: 0, orders: 0, commission: 0 };
    }
    marketplacePerf[e.marketplace].income += e.amount || 0;
    marketplacePerf[e.marketplace].orders += e.orders || 0;
    marketplacePerf[e.marketplace].commission += e.commission || 0;
  });

  const bestMarketplace = Object.entries(marketplacePerf).sort((a, b) => b[1].income - a[1].income)[0];

  return {
    totalIncome,
    totalCommission,
    netIncome: totalIncome - totalCommission,
    totalOrders,
    transactionCount: monthEntries.length,
    conversionRate,
    aov,
    commissionEfficiency: Math.round(commissionEfficiency),
    bestMarketplace: bestMarketplace ? { 
      name: bestMarketplace[0], 
      ...bestMarketplace[1] 
    } : null,
  };
};
