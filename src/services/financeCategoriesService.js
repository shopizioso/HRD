import { supabase, insertRow, upsertRow, fetchRows, subscribe } from '../lib/supabase'

export async function getFinanceCategories() {
  return await fetchRows('finance_categories')
}

export async function createFinanceCategory(cat) {
  const data = await insertRow('finance_categories', cat)
  return data
}

export async function updateFinanceCategory(cat) {
  const data = await upsertRow('finance_categories', cat)
  return data
}

export async function deleteFinanceCategory(id) {
  const { error } = await supabase.from('finance_categories').delete().eq('id', id)
  if (error) throw error
  return true
}

export function onFinanceCategoriesRealtime(callback) {
  return subscribe('finance_categories', callback)
}
