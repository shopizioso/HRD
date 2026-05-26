import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function insertRow(table, row) {
  const { data, error } = await supabase.from(table).insert(row).select()
  if (error) throw error
  return data
}

export async function upsertRow(table, row, match = ['id']) {
  const { data, error } = await supabase.from(table).upsert(row, { onConflict: match }).select()
  if (error) throw error
  return data
}

export async function fetchRows(table) {
  const { data, error } = await supabase.from(table).select('*')
  if (error) throw error
  return data
}

export function subscribe(table, callback) {
  const channel = supabase.channel(table)
  channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
    callback(payload)
  })
  channel.subscribe()
  return () => channel.unsubscribe()
}
