// ABOUTME: Verifies training summaries derived from logged Smash sets.
// ABOUTME: Covers loss tags, next-set focus, and matchup-specific review data.
import { describe, expect, it } from 'vitest'
import type { SetEntry } from '../types'
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
      drills: [
        {
          title: 'Disadvantage panic options',
          focus:
            'You often neutral air dodge fast-fall to the ground after getting hit once in juggles or weird air spots.',
        },
        {
          title: 'Jump more in stressful air spots',
          focus:
            'You often brute force your way to the ground when simply jumping away would solve the situation.',
        },
      ],
    })
  })

  it('returns an empty-data prompt when no tagged losses exist', () => {
    expect(getNextSetFocus([])).toEqual({
      title: 'Next set focus',
      detail: 'Tag a loss to get a matchup-specific focus.',
    })
  })
})

describe('getDrillsForTag', () => {
  it('maps a loss tag to its Seraph Notes drills in sheet order', () => {
    expect(getDrillsForTag('missed-kill').map((drill) => drill.title)).toEqual([
      'Down tilt 2-frames by ledge',
      'Edgeguard vs. ledge trap decisions',
    ])
    expect(getDrillsForTag('got-grabbed').map((drill) => drill.title)).toEqual([
      'Forward air spacing',
    ])
  })

  it('gives every loss tag at least one drill to run', () => {
    for (const tag of LOSS_TAGS) {
      expect(getDrillsForTag(tag.id).length).toBeGreaterThan(0)
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
