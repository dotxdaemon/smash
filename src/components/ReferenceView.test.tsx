// ABOUTME: Verifies the Seraph Notes reference remains available in the tracker.
// ABOUTME: Covers the source markers needed for a complete quick-review sheet.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SERAPH_NOTES } from '../data/seraphNotes'
import { ReferenceView } from './ReferenceView'

describe('ReferenceView', () => {
  it('renders the supplied Seraph Notes quick-review sheet', () => {
    const html = renderToStaticMarkup(<ReferenceView />)

    expect(html).toContain('Seraph Notes')
    expect(html).toContain('Palutena matchup and gameplay adjustments')
    expect(SERAPH_NOTES).toHaveLength(10)
    for (const note of SERAPH_NOTES) {
      expect(html).toContain(note.title)
    }
    expect(html).toContain(
      'Use this as a quick review sheet before sets: prioritize safer advantage pressure, cleaner ledge spacing, broader disadvantage mix-ups, and better resource awareness.',
    )
    expect(html).toContain('1.')
    expect(html).toContain('Mario up smash shield punish')
    expect(html).toContain('10.')
    expect(html).not.toContain('Playing against other people')
    expect(html).not.toContain('Smash Fundamentals')
  })
})
