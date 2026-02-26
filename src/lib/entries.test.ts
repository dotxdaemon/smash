// ABOUTME: Verifies entry creation normalization and required-opponent validation.
// ABOUTME: Locks the minimal creation contract used by the keyboard-first log form.
import { describe, expect, it } from 'vitest'
import { createEntry } from './entries'

describe('createEntry', () => {
  it('throws when opponent character is missing', () => {
    expect(() =>
      createEntry({
        opponentCharacter: '   ',
        situationTags: [],
      }),
    ).toThrow('Opponent character is required')
  })

  it('creates a normalized entry with required defaults', () => {
    const entry = createEntry({
      opponentCharacter: ' ZSS ',
      yourCharacter: '  Wolf ',
      stage: ' PS2 ',
      situationTags: ['ledge'],
      deathCauseText: ' jumped from ledge ',
      oneRuleNextTime: ' no jump from ledge ',
      clipLink: 'https://example.com/clip',
      confidence: 3,
    })

    expect(entry.id).toBeTruthy()
    expect(entry.opponentCharacter).toBe('ZSS')
    expect(entry.yourCharacter).toBe('Wolf')
    expect(entry.stage).toBe('PS2')
    expect(entry.deathCauseText).toBe('jumped from ledge')
    expect(entry.oneRuleNextTime).toBe('no jump from ledge')
    expect(entry.confidence).toBe(3)
    expect(entry.date).toMatch(/T/)
  })
})
