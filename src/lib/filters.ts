// ABOUTME: Applies composable filters for opponent, tags, stage, date, and death-cause text.
// ABOUTME: Powers the entry log search flow without introducing remote dependencies.
import type { MatchEntry, SituationTag } from '../types'

export interface EntryFilters {
  opponentCharacter?: string
  tag?: SituationTag
  stage?: string
  startDate?: string
  endDate?: string
  deathCauseSearch?: string
}

export function filterEntries(
  entries: MatchEntry[],
  filters: EntryFilters,
): MatchEntry[] {
  const searchValue = filters.deathCauseSearch?.trim().toLowerCase()

  return entries.filter((entry) => {
    if (
      filters.opponentCharacter &&
      entry.opponentCharacter !== filters.opponentCharacter
    ) {
      return false
    }

    if (filters.tag && !entry.situationTags.includes(filters.tag)) {
      return false
    }

    if (filters.stage && entry.stage !== filters.stage) {
      return false
    }

    if (filters.startDate && entry.date < filters.startDate) {
      return false
    }

    if (filters.endDate && entry.date > filters.endDate) {
      return false
    }

    if (
      searchValue &&
      !entry.deathCauseText?.toLowerCase().includes(searchValue)
    ) {
      return false
    }

    return true
  })
}
