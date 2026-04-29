// ABOUTME: Reads and writes locally saved Smash set records.
// ABOUTME: Filters malformed stored rows before app views render them.
import type { SetEntry } from '../types'

const STORAGE_KEY = 'smash-tracker'

export function loadSets(): SetEntry[] {
  try {
    return parseStoredSets(localStorage.getItem(STORAGE_KEY))
  } catch {
    return []
  }
}

export function saveSets(sets: SetEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets))
}

export function parseStoredSets(raw: string | null): SetEntry[] {
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSetEntry)
  } catch {
    return []
  }
}

function isSetEntry(value: unknown): value is SetEntry {
  if (!value || typeof value !== 'object') return false

  const record = value as Record<string, unknown>
  const requiredStrings =
    typeof record.id === 'string' &&
    typeof record.date === 'string' &&
    typeof record.opponent === 'string'
  const validDate =
    typeof record.date === 'string' &&
    Number.isFinite(new Date(record.date).getTime())
  const validResult = record.result === 'win' || record.result === 'loss'
  const validCharacter =
    record.yourCharacter === undefined || typeof record.yourCharacter === 'string'
  const validNotes = record.notes === undefined || typeof record.notes === 'string'

  return requiredStrings && validDate && validResult && validCharacter && validNotes
}
