// ABOUTME: Verifies the Reference tab lists every reference note without character-specific text.
// ABOUTME: Covers the notes that focus surfaces link to from the log and matchup screens.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { REFERENCE_NOTES } from '../data/referenceNotes'
import { ReferenceView } from './ReferenceView'

describe('ReferenceView', () => {
  it('renders the Reference heading and every reference note', () => {
    const html = renderToStaticMarkup(<ReferenceView />)

    expect(html).toContain('Reference')
    for (const note of REFERENCE_NOTES) {
      expect(html).toContain(note.title)
    }
    expect(html).not.toContain('Seraph')
    expect(html).not.toContain('Palutena')
  })
})
