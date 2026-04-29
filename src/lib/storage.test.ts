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
        result: 'win',
        notes: 'Stop jumping from ledge.',
      },
    ])

    expect(parseStoredSets(stored)).toEqual([
      {
        id: 'set-1',
        date: '2026-04-29T20:00:00.000Z',
        opponent: 'Fox',
        yourCharacter: 'Wolf',
        result: 'win',
        notes: 'Stop jumping from ledge.',
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
    ])

    expect(parseStoredSets(stored)).toEqual([])
  })

  it('returns an empty list for unreadable storage payloads', () => {
    expect(parseStoredSets('{')).toEqual([])
    expect(parseStoredSets(JSON.stringify({ id: 'set-1' }))).toEqual([])
    expect(parseStoredSets(null)).toEqual([])
  })
})
