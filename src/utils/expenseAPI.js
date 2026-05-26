/**
 * API client untuk expense management
 * Support untuk baik localStorage dan backend API
 */

const API_BASE = 'http://localhost:5000/api';
const USE_API = !!localStorage.getItem('authToken');

export const EXPENSE_CATEGORIES = [
  { code: 'operasional', name: 'Operasional', icon: '💼', color: '#8B5CF6' },
  { code: 'gaji', name: 'Gaji & Tunjangan', icon: '👤', color: '#3B82F6' },
  { code: 'marketing', name: 'Marketing & Iklan', icon: '📢', color: '#EF4444' },
  { code: 'shipping', name: 'Shipping & Logistik', icon: '🚚', color: '#F59E0B' },
  { code: 'platform_fee', name: 'Platform Fee', icon: '🛒', color: '#10B981' },
  { code: 'hosting', name: 'Hosting & Software', icon: '🌐', color: '#06B6D4' },
  { code: 'lainnya', name: 'Lainnya', icon: '📌', color: '#999999' },
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
 * Fetch expense entries dari API atau localStorage
 */
export const getExpenseEntries = async (filterDate = null) => {
  if (USE_API) {
    try {
      const response = await fetch(`${API_BASE}/expense`, {
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

  // Fallback ke localStorage
  const expenses = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
  if (filterDate) {
    return expenses.filter(e => e.date === filterDate).sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Add new expense entry
 */
export const addExpenseEntry = async (data) => {
  const entry = {
    id: Date.now(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (USE_API) {
    try {
      const response = await fetch(`${API_BASE}/expense`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(entry)
      });
      if (!response.ok) throw new Error('Failed to add');
      return await response.json();
    } catch (error) {
      console.error('Error adding to API, saving to localStorage:', error);
    }
  }

  // Fallback ke localStorage
  const expenses = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
  expenses.push(entry);
  localStorage.setItem('expenseEntries', JSON.stringify(expenses));
  return entry;
};

/**
 * Update expense entry
 */
export const updateExpenseEntry = async (id, data) => {
  if (USE_API) {
    try {
      const response = await fetch(`${API_BASE}/expense/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update');
      return await response.json();
    } catch (error) {
      console.error('Error updating via API, updating localStorage:', error);
    }
  }

  // Fallback ke localStorage
  const expenses = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
  const index = expenses.findIndex(e => e.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...data, updated_at: new Date().toISOString() };
    localStorage.setItem('expenseEntries', JSON.stringify(expenses));
    return expenses[index];
  }
  return null;
};

/**
 * Delete expense entry
 */
export const deleteExpenseEntry = async (id) => {
  if (USE_API) {
    try {
      await fetch(`${API_BASE}/expense/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting via API, deleting from localStorage:', error);
    }
  }

  // Fallback ke localStorage
  const expenses = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
  const filtered = expenses.filter(e => e.id !== id);
  localStorage.setItem('expenseEntries', JSON.stringify(filtered));
  return { success: true };
};

/**
 * Get expense summary untuk periode tertentu
 */
export const getExpenseSummary = async (startDate, endDate) => {
  const entries = await getExpenseEntries();
  const filtered = entries.filter(e => {
    const entryDate = new Date(e.date);
    return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
  });

  const summary = {
    totalAmount: 0,
    byCategory: {},
    entries: filtered
  };

  // Initialize categories
  EXPENSE_CATEGORIES.forEach(cat => {
    summary.byCategory[cat.code] = { name: cat.name, amount: 0, count: 0, icon: cat.icon };
  });

  filtered.forEach(entry => {
    summary.totalAmount += entry.amount;
    if (summary.byCategory[entry.category]) {
      summary.byCategory[entry.category].amount += entry.amount;
      summary.byCategory[entry.category].count += 1;
    }
  });

  return summary;
};

/**
 * Export expenses to CSV
 */
export const exportExpenseAsCSV = async () => {
  const entries = await getExpenseEntries();
  if (entries.length === 0) {
    console.warn('No expense entries to export');
    return null;
  }

  let csv = 'Tanggal,Kategori,Deskripsi,Jumlah,Catatan\n';
  entries.forEach(e => {
    const date = new Date(e.date).toLocaleDateString('id-ID');
    const category = EXPENSE_CATEGORIES.find(c => c.code === e.category)?.name || e.category;
    const amount = e.amount.toLocaleString('id-ID');
    const notes = (e.notes || '').replace(/"/g, '""');
    csv += `${date},"${category}","${e.description || ''}","${amount}","${notes}"\n`;
  });

  return csv;
};
