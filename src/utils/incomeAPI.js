/**
 * API client untuk income management
 * Support untuk baik localStorage dan backend API
 */

const API_BASE = 'http://localhost:5000/api';
const USE_API = !!localStorage.getItem('authToken'); // Check if user is authenticated

export const MARKETPLACE_SOURCES = [
  { code: 'shopee', name: 'Shopee', icon: '🛒', color: '#EE0000' },
  { code: 'tokopedia', name: 'Tokopedia', icon: '🏪', color: '#05AC10' },
  { code: 'tiktok', name: 'TikTok Shop', icon: '🎵', color: '#000000' },
  { code: 'lazada', name: 'Lazada', icon: '🎁', color: '#2A1F33' },
  { code: 'website', name: 'Website', icon: '🌐', color: '#0066CC' },
  { code: 'other', name: 'Lainnya', icon: '📌', color: '#999999' },
];

/**
 * Get API headers dengan authentication token
 */
const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Fetch income entries dari API atau localStorage
 */
export const getIncomeEntries = async (filterDate = null) => {
  if (USE_API) {
    try {
      const response = await fetch(`${API_BASE}/income`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch');
      let entries = await response.json();

      if (filterDate) {
        entries = entries.filter(e => e.date === filterDate);
      }

      return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error fetching from API, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const saved = localStorage.getItem('incomeEntries');
  let entries = saved ? JSON.parse(saved) : [];

  if (filterDate) {
    entries = entries.filter(e => e.date === filterDate);
  }

  return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Add income entry
 */
export const addIncomeEntry = async (entry) => {
  const entryData = {
    date: entry.date,
    marketplace: entry.marketplace,
    amount: parseFloat(entry.amount) || 0,
    orders: parseFloat(entry.orders) || 0,
    commission: parseFloat(entry.commission) || 0,
    notes: entry.note,
  };

  if (USE_API) {
    try {
      const response = await fetch(`${API_BASE}/income`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(entryData)
      });
      if (!response.ok) throw new Error('Failed to save');
      return await response.json();
    } catch (error) {
      console.error('Error saving to API, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const entries = await getIncomeEntries();
  const newEntry = {
    id: Date.now(),
    ...entryData,
    note: entry.note,
    createdAt: new Date().toISOString(),
  };
  entries.push(newEntry);
  localStorage.setItem('incomeEntries', JSON.stringify(entries));
  return newEntry;
};

/**
 * Update income entry
 */
export const updateIncomeEntry = async (id, updates) => {
  if (USE_API) {
    try {
      const response = await fetch(`${API_BASE}/income/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update');
      return await response.json();
    } catch (error) {
      console.error('Error updating in API, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const entries = await getIncomeEntries();
  const index = entries.findIndex(e => e.id === id);
  if (index !== -1) {
    entries[index] = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('incomeEntries', JSON.stringify(entries));
    return entries[index];
  }
  return null;
};

/**
 * Delete income entry
 */
export const deleteIncomeEntry = async (id) => {
  if (USE_API) {
    try {
      const response = await fetch(`${API_BASE}/income/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete');
      return true;
    } catch (error) {
      console.error('Error deleting from API, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const entries = await getIncomeEntries();
  const filtered = entries.filter(e => e.id !== id);
  localStorage.setItem('incomeEntries', JSON.stringify(filtered));
  return true;
};

/**
 * Get income summary
 */
export const getIncomeSummary = async (startDate = null, endDate = null) => {
  let entries = await getIncomeEntries();

  if (startDate) {
    entries = entries.filter(e => e.date >= startDate);
  }
  if (endDate) {
    entries = entries.filter(e => e.date <= endDate);
  }

  const summary = {};
  let totalIncome = 0;

  MARKETPLACE_SOURCES.forEach(source => {
    summary[source.code] = {
      name: source.name,
      icon: source.icon,
      total: 0,
      count: 0,
      orders: 0,
    };
  });

  entries.forEach(entry => {
    const source = entry.marketplace || 'other';
    if (!summary[source]) {
      summary[source] = { name: 'Lainnya', icon: '📌', total: 0, count: 0, orders: 0 };
    }
    summary[source].total += entry.amount || 0;
    summary[source].count++;
    summary[source].orders += entry.orders || 0;
    totalIncome += entry.amount || 0;
  });

  return { summary, totalIncome, entryCount: entries.length };
};

/**
 * Get daily income report
 */
export const getDailyIncomeReport = async (month, year) => {
  const entries = await getIncomeEntries();
  const report = {};

  entries.forEach(entry => {
    const entryDate = new Date(entry.date);
    if (entryDate.getMonth() === month && entryDate.getFullYear() === year) {
      if (!report[entry.date]) {
        report[entry.date] = {};
      }
      if (!report[entry.date][entry.marketplace]) {
        report[entry.date][entry.marketplace] = { amount: 0, orders: 0, commission: 0 };
      }
      report[entry.date][entry.marketplace].amount += entry.amount || 0;
      report[entry.date][entry.marketplace].orders += entry.orders || 0;
      report[entry.date][entry.marketplace].commission += entry.commission || 0;
    }
  });

  return report;
};

/**
 * Export income data as CSV
 */
export const exportIncomeAsCSV = async (startDate, endDate) => {
  let entries = await getIncomeEntries();

  if (startDate) {
    entries = entries.filter(e => e.date >= startDate);
  }
  if (endDate) {
    entries = entries.filter(e => e.date <= endDate);
  }

  let csv = 'Tanggal,Marketplace,Penjualan,Pesanan,Komisi,Catatan\n';
  entries.forEach(entry => {
    const date = new Date(entry.date).toLocaleDateString('id-ID');
    const marketplace = MARKETPLACE_SOURCES.find(m => m.code === entry.marketplace)?.name || 'Lainnya';
    const note = (entry.notes || entry.note || '').replace(/"/g, '""');
    csv += `"${date}","${marketplace}","${entry.amount || 0}","${entry.orders || 0}","${entry.commission || 0}","${note}"\n`;
  });

  return csv;
};
