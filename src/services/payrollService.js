import { supabase, insertRow, upsertRow, fetchRows, subscribe } from '../lib/supabase'

export async function getPayrolls() {
  return await fetchRows('payrolls')
}

export async function createPayroll(payroll) {
  const data = await insertRow('payrolls', payroll)
  return data
}

export async function updatePayroll(payroll) {
  const data = await upsertRow('payrolls', payroll)
  return data
}

export async function deletePayroll(id) {
  const { error } = await supabase.from('payrolls').delete().eq('id', id)
  if (error) throw error
  return true
}

export function onPayrollsRealtime(callback) {
  return subscribe('payrolls', callback)
}
