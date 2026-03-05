// ABOUTME: Verifies the notebook shell and navigation structure for the main app UI.
// ABOUTME: Locks the redesigned front-end landmarks without depending on browser-only APIs.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import App from './App'

describe('App notebook shell', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createStorageMock(),
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: undefined,
      configurable: true,
    })
  })

  it('renders separate desktop and mobile navigation landmarks', () => {
    const markup = renderToStaticMarkup(<App />)

    expect(markup).toContain('aria-label="Notebook navigation"')
    expect(markup).toContain('aria-label="Mobile navigation"')
  })

  it('renders a notebook cover and dashboard lead section', () => {
    const markup = renderToStaticMarkup(<App />)

    expect(markup).toContain('data-shell="tournament-notebook"')
    expect(markup).toContain('data-section="dashboard-lead"')
    expect(markup).toContain('Quick log a set')
  })
})

function createStorageMock(): Storage {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key) {
      return values.get(key) ?? null
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null
    },
    removeItem(key) {
      values.delete(key)
    },
    setItem(key, value) {
      values.set(key, value)
    },
  }
}
