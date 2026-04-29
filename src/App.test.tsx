// ABOUTME: Verifies the app renders the reference-driven shell contract.
// ABOUTME: Keeps the first screen from drifting back into generic cards.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App shell', () => {
  it('renders the ink-prism visual system without rounded card chrome', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain('data-visual-system="ink-prism"')
    expect(html).toContain('aria-label="Views"')
    expect(html).toContain('data-ink-stroke="true"')
    expect(html).not.toContain('rounded-xl')
  })
})
