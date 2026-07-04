// ABOUTME: Verifies the Notion Smash notes render on their own app page.
// ABOUTME: Keeps the people notes and fundamentals reminder separate from Seraph drills.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { NotesView } from './NotesView'

describe('NotesView', () => {
  it('renders the latest Smash notes as a quick reference', () => {
    const html = renderToStaticMarkup(<NotesView />)

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
    expect(html).not.toContain('Seraph Notes')
  })
})
