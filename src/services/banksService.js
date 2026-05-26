import { supabase, insertRow, upsertRow, fetchRows, subscribe } from '../lib/supabase'

export async function getBanks() {
  return await fetchRows('banks')
}

export async function createBank(bank) {
  const data = await insertRow('banks', bank)
  return data
}

export async function updateBank(bank) {
  const data = await upsertRow('banks', bank)
  return data
}

export async function deleteBank(id) {
  const { error } = await supabase.from('banks').delete().eq('id', id)
  if (error) throw error
  return true
}

export function onBanksRealtime(callback) {
  return subscribe('banks', callback)
}
