// ABOUTME: Persists entries and pinned drills in localStorage using a versioned payload.
// ABOUTME: Keeps the MVP local-only while supporting safe schema evolution.
import type { MatchEntry } from '../types'

const STORAGE_KEY = 'smash-matchup-lab.v1'
const STORAGE_VERSION = 1

export interface SavedState {
  entries: MatchEntry[]
  pinnedDrills: string[]
}

interface StoredStateV1 extends SavedState {
  version: number
}

export function loadState(): SavedState {
  const rawValue = localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return { entries: [], pinnedDrills: [] }
  }

  try {
    const parsedValue = JSON.parse(rawValue) as StoredStateV1
    if (
      parsedValue.version !== STORAGE_VERSION ||
      !Array.isArray(parsedValue.entries) ||
      !Array.isArray(parsedValue.pinnedDrills)
    ) {
      return { entries: [], pinnedDrills: [] }
    }

    return {
      entries: parsedValue.entries,
      pinnedDrills: parsedValue.pinnedDrills,
    }
  } catch {
    return { entries: [], pinnedDrills: [] }
  }
}

export function saveState(state: SavedState): void {
  const value: StoredStateV1 = {
    version: STORAGE_VERSION,
    entries: state.entries,
    pinnedDrills: state.pinnedDrills,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}
