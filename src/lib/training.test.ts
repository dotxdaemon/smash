// ABOUTME: Verifies training summaries derived from logged Smash sets.
// ABOUTME: Covers loss tags, next-set focus, and matchup-specific review data.
import { describe, expect, it } from 'vitest'
import type { SetEntry } from '../types'
import { getMatchupSummary, getNextSetFocus } from './training'

const sets: SetEntry[] = [
  {
    id: 'set-3',
    date: '2026-05-11T20:00:00.000Z',
    opponent: 'Fox',
    yourCharacter: 'Palutena',
    result: 'loss',
    lossTags: ['panic-option'],
    notes: 'Held shield too long in the corner.',
  },
  {
    id: 'set-2',
    date: '2026-05-11T19:00:00.000Z',
    opponent: 'Marth',
    yourCharacter: 'Palutena',
    result: 'loss',
    lossTags: ['could-not-land'],
  },
  {
    id: 'set-1',
    date: '2026-05-11T18:00:00.000Z',
    opponent: 'Fox',
    yourCharacter: 'Palutena',
    result: 'loss',
    lossTags: ['panic-option', 'got-grabbed'],
    notes: 'Stop rolling after blocked fair.',
  },
  {
    id: 'set-0',
    date: '2026-05-11T17:00:00.000Z',
    opponent: 'Fox',
    yourCharacter: 'Palutena',
    result: 'win',
  },
]

describe('getNextSetFocus', () => {
  it('turns recent tagged losses into one concrete focus', () => {
    expect(getNextSetFocus(sets)).toEqual({
      title: 'Next set focus',
      opponent: 'Fox',
      tagLabel: 'Panic option',
      detail: 'Against Fox, hold your position for one beat before choosing an escape.',
    })
  })

  it('returns an empty-data prompt when no tagged losses exist', () => {
    expect(getNextSetFocus([])).toEqual({
      title: 'Next set focus',
      detail: 'Tag a loss to get a matchup-specific focus.',
    })
  })
})

describe('getMatchupSummary', () => {
  it('builds opponent-specific records, tags, notes, and focus', () => {
    expect(getMatchupSummary(sets, 'Fox')).toMatchObject({
      opponent: 'Fox',
      wins: 1,
      losses: 2,
      total: 3,
      commonLossTags: [
        { id: 'panic-option', label: 'Panic option', count: 2 },
        { id: 'got-grabbed', label: 'Got grabbed', count: 1 },
      ],
      notes: ['Held shield too long in the corner.', 'Stop rolling after blocked fair.'],
      focus: {
        title: 'Next set focus',
        opponent: 'Fox',
        tagLabel: 'Panic option',
      },
    })
  })
})
