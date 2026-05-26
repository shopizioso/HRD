/**
 * Advanced Filtering Utility
 */

export const createFilter = (name, rules = {}) => {
  return {
    id: Date.now(),
    name,
    dateRange: rules.dateRange || { start: null, end: null },
    marketplaces: rules.marketplaces || [],
    amountRange: rules.amountRange || { min: 0, max: Infinity },
    minOrders: rules.minOrders || 0,
    search: rules.search || '',
    savedAt: new Date().toISOString(),
  };
};

export const getFilteredEntries = (entries, filter) => {
  let filtered = [...entries];

  // Date range filter
  if (filter.dateRange?.start) {
    filtered = filtered.filter(e => e.date >= filter.dateRange.start);
  }
  if (filter.dateRange?.end) {
    filtered = filtered.filter(e => e.date <= filter.dateRange.end);
  }

  // Marketplace filter
  if (filter.marketplaces && filter.marketplaces.length > 0) {
    filtered = filtered.filter(e => filter.marketplaces.includes(e.marketplace));
  }

  // Amount range filter
  filtered = filtered.filter(e => {
    const amount = e.amount || 0;
    return amount >= filter.amountRange.min && amount <= filter.amountRange.max;
  });

  // Minimum orders filter
  if (filter.minOrders > 0) {
    filtered = filtered.filter(e => (e.orders || 0) >= filter.minOrders);
  }

  // Text search in notes
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(e =>
      (e.note || '').toLowerCase().includes(searchLower) ||
      (e.marketplace || '').toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

export const getSavedFilters = () => {
  const saved = localStorage.getItem('incomeFilters');
  return saved ? JSON.parse(saved) : [];
};

export const saveFilter = (filter) => {
  const filters = getSavedFilters();
  filters.push(filter);
  localStorage.setItem('incomeFilters', JSON.stringify(filters));
  return filter;
};

export const deleteFilter = (id) => {
  const filters = getSavedFilters();
  const filtered = filters.filter(f => f.id !== id);
  localStorage.setItem('incomeFilters', JSON.stringify(filtered));
};

export const getFilterStats = (entries, filter) => {
  const filtered = getFilteredEntries(entries, filter);
  
  return {
    totalEntries: filtered.length,
    totalAmount: filtered.reduce((sum, e) => sum + (e.amount || 0), 0),
    totalOrders: filtered.reduce((sum, e) => sum + (e.orders || 0), 0),
    totalCommission: filtered.reduce((sum, e) => sum + (e.commission || 0), 0),
    avgAmount: filtered.length > 0 ? filtered.reduce((sum, e) => sum + (e.amount || 0), 0) / filtered.length : 0,
    avgOrders: filtered.length > 0 ? filtered.reduce((sum, e) => sum + (e.orders || 0), 0) / filtered.length : 0,
  };
};

export const exportFilteredAsCSV = (entries, filter, filename) => {
  const filtered = getFilteredEntries(entries, filter);
  
  let csv = 'Tanggal,Marketplace,Penjualan,Pesanan,Komisi,Catatan\n';
  filtered.forEach(entry => {
    const date = new Date(entry.date).toLocaleDateString('id-ID');
    const note = (entry.note || '').replace(/"/g, '""');
    csv += `"${date}","${entry.marketplace}","${entry.amount || 0}","${entry.orders || 0}","${entry.commission || 0}","${note}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `filtered-data-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
