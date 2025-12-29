import * as repo from '../repo/db'

export async function inferFromHistory(phone?: string) {
  if (!phone) return null
  const last = await repo.findLastCallByPhone(phone)
  if (!last) return null
  return { region: last.inferred_location, confidence: 0.2 }
}
