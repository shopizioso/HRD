import { supabase, insertRow, upsertRow, fetchRows, subscribe } from '../lib/supabase'

export async function getInvoices() {
  return await fetchRows('invoices')
}

export async function createInvoice(invoice) {
  const data = await insertRow('invoices', invoice)
  return data
}

export async function updateInvoice(invoice) {
  const data = await upsertRow('invoices', invoice)
  return data
}

export async function deleteInvoice(id) {
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) throw error
  return true
}

export function onInvoicesRealtime(callback) {
  return subscribe('invoices', callback)
}
