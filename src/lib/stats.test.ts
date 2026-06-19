// ABOUTME: Verifies overall record, per-opponent records, and recent form math.
// ABOUTME: Keeps win-rate and scoreboard summaries independent from the views.
import { describe, expect, it } from 'vitest'
import { getOpponentRecords, getOverallRecord, getRecentForm } from './stats'
import type { SetEntry } from '../types'

function set(partial: Partial<SetEntry> & Pick<SetEntry, 'result'>): SetEntry {
  return {
    id: partial.id ?? crypto.randomUUID(),
    date: partial.date ?? '2026-01-01T00:00:00.000Z',
    opponent: partial.opponent ?? 'Fox',
    yourCharacter: 'Palutena',
    result: partial.result,
    notes: partial.notes,
    lossTags: partial.lossTags,
  }
}

describe('getOverallRecord', () => {
  it('returns zeroed totals and a null win rate with no sets', () => {
    expect(getOverallRecord([])).toEqual({
      wins: 0,
      losses: 0,
      total: 0,
      winRate: null,
    })
  })

  it('counts wins and losses and computes a fractional win rate', () => {
    const sets = [
      set({ result: 'win' }),
      set({ result: 'win' }),
      set({ result: 'win' }),
      set({ result: 'loss' }),
    ]

    expect(getOverallRecord(sets)).toEqual({
      wins: 3,
      losses: 1,
      total: 4,
      winRate: 0.75,
    })
  })
})

describe('getOpponentRecords', () => {
  it('groups by opponent and sorts by total then name', () => {
    const sets = [
      set({ opponent: 'Fox', result: 'win' }),
      set({ opponent: 'Fox', result: 'loss' }),
      set({ opponent: 'Marth', result: 'win' }),
      set({ opponent: 'Roy', result: 'win' }),
    ]

    const records = getOpponentRecords(sets)

    expect(records.map((record) => record.name)).toEqual(['Fox', 'Marth', 'Roy'])
    expect(records[0]).toEqual({
      name: 'Fox',
      wins: 1,
      losses: 1,
      total: 2,
      winRate: 0.5,
    })
  })

  it('breaks ties alphabetically regardless of insertion order', () => {
    const sets = [
      set({ opponent: 'Zelda', result: 'win' }),
      set({ opponent: 'Bowser', result: 'loss' }),
    ]

    expect(getOpponentRecords(sets).map((record) => record.name)).toEqual([
      'Bowser',
      'Zelda',
    ])
  })
})

describe('getRecentForm', () => {
  it('returns the most recent results first within the limit', () => {
    const sets = [
      set({ result: 'win', date: '2026-01-01T00:00:00.000Z' }),
      set({ result: 'loss', date: '2026-01-02T00:00:00.000Z' }),
      set({ result: 'win', date: '2026-01-03T00:00:00.000Z' }),
    ]

    expect(getRecentForm(sets, 2)).toEqual(['win', 'loss'])
  })

  it('defaults to the five most recent results', () => {
    const sets = Array.from({ length: 7 }, (_, index) =>
      set({
        result: index % 2 === 0 ? 'win' : 'loss',
        date: `2026-01-0${index + 1}T00:00:00.000Z`,
      }),
    )

    const form = getRecentForm(sets)
    expect(form).toHaveLength(5)
    expect(form[0]).toBe('win') // 2026-01-07, the most recent
  })

  it('returns every result when there are fewer than the limit', () => {
    const sets = [
      set({ result: 'loss', date: '2026-01-01T00:00:00.000Z' }),
      set({ result: 'win', date: '2026-01-02T00:00:00.000Z' }),
    ]

    expect(getRecentForm(sets)).toEqual(['win', 'loss'])
  })
})
