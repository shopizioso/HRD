import { supabase, insertRow, upsertRow, fetchRows, subscribe } from '../lib/supabase'

export async function getTransactions() {
  return await fetchRows('transactions')
}

export async function createTransaction(tx) {
  const data = await insertRow('transactions', tx)
  return data
}

export async function updateTransaction(tx) {
  const data = await upsertRow('transactions', tx)
  return data
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
  return true
}

export function onTransactionsRealtime(callback) {
  return subscribe('transactions', callback)
}
