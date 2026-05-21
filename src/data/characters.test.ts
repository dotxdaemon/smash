// ABOUTME: Verifies free-text opponent names resolve to known Smash characters.
// ABOUTME: Keeps stats and matchup grouping aligned with the character list.
import { describe, expect, it } from 'vitest'
import { canonicalizeOpponentName } from './characters'

describe('canonicalizeOpponentName', () => {
  it('returns the character-list spelling for close free-text matches', () => {
    expect(canonicalizeOpponentName('fox')).toBe('Fox')
    expect(canonicalizeOpponentName('  FOX  ')).toBe('Fox')
    expect(canonicalizeOpponentName('r o b')).toBe('R.O.B.')
    expect(canonicalizeOpponentName('mr game and watch')).toBe('Mr. Game & Watch')
  })

  it('keeps unknown free-text opponents while cleaning surrounding spacing', () => {
    expect(canonicalizeOpponentName('  Local player   name  ')).toBe(
      'Local player name',
    )
  })
})
