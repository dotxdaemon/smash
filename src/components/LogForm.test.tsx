// ABOUTME: Verifies the log form keeps its focus-panel title stable across states.
// ABOUTME: Guards the tag chip so recommendations never replace the panel label.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LogForm } from './LogForm'

describe('LogForm', () => {
  it('keeps the focus panel title and shows the driving tag as a chip', () => {
    const html = renderToStaticMarkup(
      <LogForm
        focus={{
          title: 'Next set focus',
          detail:
            'Against Fox, keep Palutena outside grab range and punish the whiff.',
          opponent: 'Fox',
          tagLabel: 'Got grabbed',
        }}
        onSubmit={() => {}}
        onOpenNotes={() => {}}
      />,
    )

    expect(html).toContain('focus-kicker">Next set focus<')
    expect(html).toContain('focus-tag')
    expect(html).toContain('Got grabbed')
  })

  it('labels the focus panel without a tag when no losses are tagged yet', () => {
    const html = renderToStaticMarkup(
      <LogForm
        focus={{
          title: 'Next set focus',
          detail: 'Tag a loss to get a matchup-specific focus.',
        }}
        onSubmit={() => {}}
        onOpenNotes={() => {}}
      />,
    )

    expect(html).toContain('focus-kicker">Next set focus<')
    expect(html).not.toContain('focus-tag')
  })
})
