// ABOUTME: Verifies entry filtering and text search behavior for the entry log.
// ABOUTME: Ensures combined filters remain deterministic and composable.
import { describe, expect, it } from 'vitest'
import type { MatchEntry } from '../types'
import { filterEntries } from './filters'

const entries: MatchEntry[] = [
  {
    id: '1',
    date: '2026-02-01T10:00:00.000Z',
    opponentCharacter: 'ZSS',
    stage: 'PS2',
    situationTags: ['ledge', 'disadvantage'],
    deathCauseText: 'jumped from ledge into fair',
    deathCauseCategory: 'ledge option',
  },
  {
    id: '2',
    date: '2026-02-02T10:00:00.000Z',
    opponentCharacter: 'Cloud',
    stage: 'Town',
    situationTags: ['neutral'],
    deathCauseText: 'unsafe nair on shield',
    deathCauseCategory: 'unsafe aerial on shield',
  },
  {
    id: '3',
    date: '2026-02-03T10:00:00.000Z',
    opponentCharacter: 'ZSS',
    stage: 'Hollow Bastion',
    situationTags: ['platform'],
    deathCauseText: 'got hit trying to land',
    deathCauseCategory: 'landing habit',
  },
]

describe('filterEntries', () => {
  it('applies opponent, tag, stage, date, and death cause search filters', () => {
    const filtered = filterEntries(entries, {
      opponentCharacter: 'ZSS',
      tag: 'ledge',
      stage: 'PS2',
      startDate: '2026-02-01T00:00:00.000Z',
      endDate: '2026-02-01T23:59:59.000Z',
      deathCauseSearch: 'fair',
    })

    expect(filtered.map((entry) => entry.id)).toEqual(['1'])
  })

  it('returns all entries when filters are empty', () => {
    const filtered = filterEntries(entries, {})

    expect(filtered).toHaveLength(3)
  })
})
