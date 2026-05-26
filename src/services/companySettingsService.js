import { supabase, insertRow, upsertRow, fetchRows, subscribe } from '../lib/supabase'

export async function getCompanySettings() {
  return await fetchRows('company_settings')
}

export async function createCompanySettings(settings) {
  const data = await insertRow('company_settings', settings)
  return data
}

export async function updateCompanySettings(settings) {
  const data = await upsertRow('company_settings', settings)
  return data
}

export async function deleteCompanySettings(id) {
  const { error } = await supabase.from('company_settings').delete().eq('id', id)
  if (error) throw error
  return true
}

export function onCompanySettingsRealtime(callback) {
  return subscribe('company_settings', callback)
}
