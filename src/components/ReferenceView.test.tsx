// ABOUTME: Verifies the Seraph Notes reference remains available in the tracker.
// ABOUTME: Covers the source markers needed for a complete quick-review sheet.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SERAPH_NOTES } from '../data/seraphNotes'
import { ReferenceView } from './ReferenceView'

describe('ReferenceView', () => {
  it('renders the latest Smash notes as a quick reference', () => {
    const html = renderToStaticMarkup(<ReferenceView />)

    expect(html).toContain('Playing against other people')
    expect(html).toContain(
      'Josh - Stay patient, look for options rather than commitments. Stay outside the triangle',
    )
    expect(html).toContain(
      'Kipum - Play at my own pace, don’t let his punish game scare me from playing the game. Play neutral more grounded, observe what he does out of shield (drift-back, aerial, grab, etc.)',
    )
    expect(html).toContain(
      '6/23 - Avoid setups, watch for habits. Stay outside the triangle. Don’t commit too much',
    )
    expect(html).toContain('Smash Fundamentals')
    expect(html).toContain(
      'Play NEUTRAL, ADVANTAGE AND DISADVANTAGE deliberately. Don’t just rush in/mash buttons/hope to kill them. Have a plan for what the opponent is showing you. Gather data.',
    )
  })

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
  })
})
