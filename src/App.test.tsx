// ABOUTME: Verifies the app renders the reference-driven shell contract.
// ABOUTME: Keeps the first screen from drifting back into generic cards.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App shell', () => {
  it('renders the compact training ledger system without rounded card chrome', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain('data-visual-system="training-ledger"')
    expect(html).toContain('data-layout="compact-workspace"')
    expect(html).toContain('aria-label="Views"')
    expect(html).not.toContain('data-ink-stroke')
    expect(html).not.toContain('rounded-xl')
  })

  it('renders Palutena as the only player character on the log screen', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain('Palutena')
    expect(html).not.toContain('placeholder="e.g. Wolf"')
  })

  it('renders the training surfaces that turn logs into next actions', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain('aria-label="Next set focus"')
    expect(html).toContain('data-matchup-pages="history-opponents"')
  })
})
