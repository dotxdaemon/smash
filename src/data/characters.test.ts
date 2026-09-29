// ABOUTME: Verifies free-text opponent names resolve to known Smash characters.
// ABOUTME: Keeps stats and matchup grouping aligned with the character list.
import { describe, expect, it } from 'vitest'
import { CHARACTERS, canonicalizeOpponentName } from './characters'

describe('canonicalizeOpponentName', () => {
  it('returns the character-list spelling for close free-text matches', () => {
    expect(canonicalizeOpponentName('fox')).toBe('Fox')
    expect(canonicalizeOpponentName('  FOX  ')).toBe('Fox')
    expect(canonicalizeOpponentName('dr mario')).toBe('Dr. Mario')
    expect(canonicalizeOpponentName('mr game and watch')).toBe('Mr. Game & Watch')
  })

  it('keeps unknown free-text opponents while cleaning surrounding spacing', () => {
    expect(canonicalizeOpponentName('  Local player   name  ')).toBe(
      'Local player name',
    )
  })

  it('keeps opponents outside the Melee roster as typed', () => {
    expect(canonicalizeOpponentName('  Pit ')).toBe('Pit')
  })
})

describe('CHARACTERS', () => {
  it('lists the 26 Melee characters', () => {
    expect(CHARACTERS).toHaveLength(26)
    expect(CHARACTERS).toContain('Marth')
    expect(CHARACTERS).toContain('Sheik')
    expect(CHARACTERS).not.toContain('Palutena')
  })
})
