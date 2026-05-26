import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import { useLoading } from '../context/LoadingContext'

export function useApi() {
  const { addToast } = useToast()
  const { start, stop } = useLoading()

  const run = useCallback(async (fn, { successMsg, errorMsg } = {}) => {
    start()
    try {
      const res = await fn()
      if (successMsg) addToast(successMsg, 'success')
      stop()
      return { data: res, error: null }
    } catch (err) {
      console.error('API error', err)
      if (errorMsg) addToast(errorMsg, 'error')
      else addToast(err.message || 'Terjadi kesalahan', 'error')
      stop()
      return { data: null, error: err }
    }
  }, [addToast, start, stop])

  const select = useCallback((table) => run(() => supabase.from(table).select('*').then(r => { if (r.error) throw r.error; return r.data })), [run])
  const insert = useCallback((table, payload) => run(() => supabase.from(table).insert(payload).select().then(r => { if (r.error) throw r.error; return r.data })), [run])
  const upsert = useCallback((table, payload) => run(() => supabase.from(table).upsert(payload).select().then(r => { if (r.error) throw r.error; return r.data })), [run])
  const remove = useCallback((table, key, val) => run(() => supabase.from(table).delete().eq(key, val).then(r => { if (r.error) throw r.error; return r.data })), [run])

  return { select, insert, upsert, remove, run }
}
