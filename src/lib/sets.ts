// ABOUTME: Creates saved set records and filters history by opponent and result.
// ABOUTME: Keeps entry rules and history filtering independent from the views.
import { canonicalizeOpponentName } from '../data/characters'
import type { LossTag, SetEntry } from '../types'

export const PLAYER_CHARACTER = 'Palutena'

export type SetEntryInput = {
  opponent: string
  result: 'win' | 'loss'
  notes: string
  lossTags: LossTag[]
}

export type ResultFilter = 'all' | 'win' | 'loss'

export type SetFilter = {
  query?: string
  result?: ResultFilter
}

export function createSetEntry({
  opponent,
  result,
  notes,
  lossTags,
}: SetEntryInput): SetEntry {
  const entry: SetEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    opponent: canonicalizeOpponentName(opponent),
    yourCharacter: PLAYER_CHARACTER,
    result,
    notes: notes.trim() || undefined,
  }

  if (result === 'loss' && lossTags.length > 0) {
    entry.lossTags = [...lossTags]
  }

  return entry
}

export function filterSets(sets: SetEntry[], filter: SetFilter): SetEntry[] {
  const query = filter.query?.trim().toLowerCase() ?? ''
  const result = filter.result ?? 'all'

  return sets.filter((set) => {
    if (result !== 'all' && set.result !== result) return false
    if (query && !set.opponent.toLowerCase().includes(query)) return false
    return true
  })
}
