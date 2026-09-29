// ABOUTME: Verifies training summaries derived from logged Smash sets.
// ABOUTME: Covers loss tags, next-set focus, and matchup-specific review data.
import { describe, expect, it } from 'vitest'
import type { LossTag, SetEntry } from '../types'
import {
  LOSS_TAGS,
  getDrillsForTag,
  getLossHabits,
  getMatchupSummary,
  getNextSetFocus,
} from './training'

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
      drills: [],
    })
  })

  it('returns an empty-data prompt when no tagged losses exist', () => {
    expect(getNextSetFocus([])).toEqual({
      title: 'Next set focus',
      detail: 'Tag a loss to get a matchup-specific focus.',
    })
  })
})

describe('LOSS_TAGS', () => {
  it('gives coaching focus that does not depend on one character', () => {
    for (const tag of LOSS_TAGS) {
      expect(tag.focus).not.toMatch(/palutena|teleport/i)
    }
  })
})

describe('getDrillsForTag', () => {
  const notes = [
    {
      title: 'Ledge spacing',
      focus: 'Stay out of range at the ledge.',
      points: ['Hold neutral before stepping in.'],
      relatedTags: ['missed-kill', 'edgeguarded'] as LossTag[],
    },
    {
      title: 'Grab range',
      focus: 'Stay outside grab range.',
      points: ['Punish the whiff.'],
      relatedTags: ['got-grabbed'] as LossTag[],
    },
    {
      title: 'Ledge trap choices',
      focus: 'Pick one safe option.',
      points: ['Commit to one option.'],
      relatedTags: ['missed-kill'] as LossTag[],
    },
  ]

  it('maps a loss tag to its tagged notes in sheet order', () => {
    expect(getDrillsForTag('missed-kill', notes).map((drill) => drill.title)).toEqual([
      'Ledge spacing',
      'Ledge trap choices',
    ])
    expect(getDrillsForTag('got-grabbed', notes).map((drill) => drill.title)).toEqual([
      'Grab range',
    ])
    expect(getDrillsForTag('panic-option', notes)).toEqual([])
  })

  it('returns only the title and focus of each note', () => {
    expect(getDrillsForTag('got-grabbed', notes)).toEqual([
      { title: 'Grab range', focus: 'Stay outside grab range.' },
    ])
  })

  it('returns no drills while there are no reference notes', () => {
    for (const tag of LOSS_TAGS) {
      expect(getDrillsForTag(tag.id)).toEqual([])
    }
  })
})

describe('getLossHabits', () => {
  const habitSets: SetEntry[] = [
    {
      id: 'h-4',
      date: '2026-01-05T00:00:00.000Z',
      opponent: 'Fox',
      result: 'loss',
      lossTags: ['panic-option', 'got-grabbed'],
    },
    {
      id: 'h-3',
      date: '2026-01-04T00:00:00.000Z',
      opponent: 'Fox',
      result: 'win',
    },
    {
      id: 'h-2',
      date: '2026-01-03T00:00:00.000Z',
      opponent: 'Marth',
      result: 'loss',
      lossTags: ['panic-option'],
    },
    {
      id: 'h-1',
      date: '2026-01-01T00:00:00.000Z',
      opponent: 'Roy',
      result: 'loss',
      lossTags: ['missed-kill'],
    },
  ]

  it('counts tags across all losses and within the recent window', () => {
    expect(getLossHabits(habitSets)).toEqual([
      { id: 'panic-option', label: 'Panic option', total: 2, recent: 2 },
      { id: 'got-grabbed', label: 'Got grabbed', total: 1, recent: 1 },
      { id: 'missed-kill', label: 'Missed kill', total: 1, recent: 1 },
    ])
  })

  it('limits the recent count to the last N sets by date', () => {
    const habits = getLossHabits(habitSets, 2)
    expect(habits.find((habit) => habit.id === 'panic-option')?.recent).toBe(1)
    expect(habits.find((habit) => habit.id === 'missed-kill')?.recent).toBe(0)
  })

  it('returns an empty list when no losses carry tags', () => {
    expect(getLossHabits([])).toEqual([])
    expect(
      getLossHabits([
        { id: 'w', date: '2026-01-01T00:00:00.000Z', opponent: 'Fox', result: 'win' },
      ]),
    ).toEqual([])
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
