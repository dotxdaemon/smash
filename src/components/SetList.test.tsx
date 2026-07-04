// ABOUTME: Verifies set rows mark results with readable win/loss letter badges.
// ABOUTME: Keeps the list scannable instead of relying on tiny color dots.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SetList } from './SetList'
import type { SetEntry } from '../types'

const SETS: SetEntry[] = [
  {
    id: 'a',
    date: '2026-07-01T10:00:00.000Z',
    opponent: 'Fox',
    yourCharacter: 'Palutena',
    result: 'win',
  },
  {
    id: 'b',
    date: '2026-07-02T10:00:00.000Z',
    opponent: 'Roy',
    yourCharacter: 'Palutena',
    result: 'loss',
    lossTags: ['shield-pressure'],
    notes: 'Rolled too much.',
  },
]

describe('SetList', () => {
  it('marks each set with a win or loss letter badge', () => {
    const html = renderToStaticMarkup(<SetList sets={SETS} onDelete={() => {}} />)

    expect(html).toContain('result-badge is-win')
    expect(html).toContain('result-badge is-loss')
    expect(html).toContain('>W<')
    expect(html).toContain('>L<')
    expect(html).not.toContain('result-dot')
  })
})
