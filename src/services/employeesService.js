import { supabase, insertRow, upsertRow, fetchRows, subscribe } from '../lib/supabase'

export async function getEmployees() {
  return await fetchRows('employees')
}

export async function createEmployee(employee) {
  const data = await insertRow('employees', employee)
  return data
}

export async function updateEmployee(employee) {
  const data = await upsertRow('employees', employee)
  return data
}

export async function deleteEmployee(id) {
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) throw error
  return true
}

export function onEmployeesRealtime(callback) {
  return subscribe('employees', callback)
}
