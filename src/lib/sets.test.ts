// ABOUTME: Verifies set-entry creation rules and history filtering.
// ABOUTME: Keeps entry canonicalization and filters independent from the views.
import { describe, expect, it } from 'vitest'
import { buildSetsBackup, createSetEntry, filterSets } from './sets'
import type { SetEntry } from '../types'

describe('createSetEntry', () => {
  it('canonicalizes the opponent and fixes the player to Palutena', () => {
    const entry = createSetEntry({
      opponent: '  fox ',
      result: 'win',
      notes: '',
      lossTags: [],
    })

    expect(entry.opponent).toBe('Fox')
    expect(entry.yourCharacter).toBe('Palutena')
    expect(entry.result).toBe('win')
    expect(entry.notes).toBeUndefined()
    expect(entry.lossTags).toBeUndefined()
    expect(typeof entry.id).toBe('string')
    expect(Number.isFinite(new Date(entry.date).getTime())).toBe(true)
  })

  it('trims notes and keeps loss tags only for losses', () => {
    const loss = createSetEntry({
      opponent: 'Marth',
      result: 'loss',
      notes: '  watch the tipper  ',
      lossTags: ['got-grabbed'],
    })
    expect(loss.notes).toBe('watch the tipper')
    expect(loss.lossTags).toEqual(['got-grabbed'])

    const win = createSetEntry({
      opponent: 'Marth',
      result: 'win',
      notes: 'clean',
      lossTags: ['got-grabbed'],
    })
    expect(win.lossTags).toBeUndefined()
  })

  it('omits loss tags when a loss is logged without any', () => {
    const loss = createSetEntry({
      opponent: 'Marth',
      result: 'loss',
      notes: '',
      lossTags: [],
    })
    expect(loss.lossTags).toBeUndefined()
  })
})

describe('filterSets', () => {
  const sets: SetEntry[] = [
    {
      id: '1',
      date: '2026-01-01T00:00:00.000Z',
      opponent: 'Fox',
      result: 'win',
    },
    {
      id: '2',
      date: '2026-01-02T00:00:00.000Z',
      opponent: 'Falco',
      result: 'loss',
    },
    {
      id: '3',
      date: '2026-01-03T00:00:00.000Z',
      opponent: 'Marth',
      result: 'win',
    },
  ]

  it('returns every set with empty filters', () => {
    expect(filterSets(sets, {})).toHaveLength(3)
  })

  it('filters by result', () => {
    expect(filterSets(sets, { result: 'win' }).map((s) => s.opponent)).toEqual([
      'Fox',
      'Marth',
    ])
  })

  it('filters by case-insensitive opponent substring', () => {
    expect(filterSets(sets, { query: 'fa' }).map((s) => s.opponent)).toEqual([
      'Falco',
    ])
  })

  it('applies query and result together', () => {
    expect(
      filterSets(sets, { query: 'f', result: 'win' }).map((s) => s.opponent),
    ).toEqual(['Fox'])
  })

  it('treats a whitespace-only query as no query', () => {
    expect(filterSets(sets, { query: '   ' })).toHaveLength(3)
  })

  it('preserves input order', () => {
    expect(filterSets(sets, {}).map((s) => s.id)).toEqual(['1', '2', '3'])
  })
})

describe('buildSetsBackup', () => {
  const sets: SetEntry[] = [
    {
      id: '1',
      date: '2026-01-01T00:00:00.000Z',
      opponent: 'Fox',
      result: 'win',
    },
  ]

  it('names the file with the calendar day and serializes the sets', () => {
    const backup = buildSetsBackup(sets, '2026-06-18T15:04:00.000Z')

    expect(backup.filename).toBe('smash-tracker-2026-06-18.json')
    expect(JSON.parse(backup.json)).toEqual(sets)
  })
})
