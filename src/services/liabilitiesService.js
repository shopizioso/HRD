import { supabase, insertRow, upsertRow, fetchRows, subscribe } from '../lib/supabase'

export async function getLiabilities() {
  return await fetchRows('liabilities')
}

export async function createLiability(item) {
  const data = await insertRow('liabilities', item)
  return data
}

export async function updateLiability(item) {
  const data = await upsertRow('liabilities', item)
  return data
}

export async function deleteLiability(id) {
  const { error } = await supabase.from('liabilities').delete().eq('id', id)
  if (error) throw error
  return true
}

export function onLiabilitiesRealtime(callback) {
  return subscribe('liabilities', callback)
}
