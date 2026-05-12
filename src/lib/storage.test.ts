// ABOUTME: Verifies stored set data is accepted only when it can safely render.
// ABOUTME: Covers malformed persistence payloads before they reach app views.
import { describe, expect, it } from 'vitest'
import { parseStoredSets } from './storage'

describe('parseStoredSets', () => {
  it('keeps valid set entries from storage', () => {
    const stored = JSON.stringify([
      {
        id: 'set-1',
        date: '2026-04-29T20:00:00.000Z',
        opponent: 'Fox',
        yourCharacter: 'Wolf',
        result: 'loss',
        notes: 'Stop jumping from ledge.',
        lossTags: ['panic-option', 'got-grabbed'],
      },
    ])

    expect(parseStoredSets(stored)).toEqual([
      {
        id: 'set-1',
        date: '2026-04-29T20:00:00.000Z',
        opponent: 'Fox',
        yourCharacter: 'Wolf',
        result: 'loss',
        notes: 'Stop jumping from ledge.',
        lossTags: ['panic-option', 'got-grabbed'],
      },
    ])
  })

  it('drops malformed set entries that would break history or stats', () => {
    const stored = JSON.stringify([
      {
        id: 'bad-date',
        date: 'not-a-date',
        opponent: 'Fox',
        result: 'win',
      },
      {
        id: 'bad-result',
        date: '2026-04-29T20:00:00.000Z',
        opponent: 'Fox',
        result: 'draw',
      },
      {
        id: 'bad-opponent',
        date: '2026-04-29T20:00:00.000Z',
        opponent: 42,
        result: 'loss',
      },
      {
        id: 'bad-loss-tags',
        date: '2026-04-29T20:00:00.000Z',
        opponent: 'Fox',
        result: 'loss',
        lossTags: ['panic-option', 42],
      },
      {
        id: 'bad-win-loss-tags',
        date: '2026-04-29T20:00:00.000Z',
        opponent: 'Fox',
        result: 'win',
        lossTags: ['panic-option'],
      },
    ])

    expect(parseStoredSets(stored)).toEqual([])
  })

  it('returns an empty list for unreadable storage payloads', () => {
    expect(parseStoredSets('{')).toEqual([])
    expect(parseStoredSets(JSON.stringify({ id: 'set-1' }))).toEqual([])
    expect(parseStoredSets(null)).toEqual([])
  })
})
