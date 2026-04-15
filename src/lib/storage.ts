import type { SetEntry } from '../types'

const STORAGE_KEY = 'smash-tracker'

export function loadSets(): SetEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveSets(sets: SetEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets))
}
