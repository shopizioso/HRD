import { supabase, insertRow, upsertRow, fetchRows } from '../lib/supabase'

export async function getProfileById(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function upsertProfile(profile) {
  const { data, error } = await supabase.from('profiles').upsert(profile).select()
  if (error) throw error
  return data
}

export async function createProfile(profile) {
  return await insertRow('profiles', profile)
}
