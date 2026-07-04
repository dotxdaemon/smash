// ABOUTME: Verifies toasts render with or without an action button.
// ABOUTME: Covers the confirmation-only toast shown after saving a set.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Toast } from './Toast'

const noop = () => {}

describe('Toast', () => {
  it('renders an action button only when a label is provided', () => {
    const withAction = renderToStaticMarkup(
      <Toast
        toast={{ id: 1, message: 'Set deleted.', actionLabel: 'Undo' }}
        onAction={noop}
        onPause={noop}
        onResume={noop}
      />,
    )
    const withoutAction = renderToStaticMarkup(
      <Toast
        toast={{ id: 2, message: 'Set logged — vs Fox' }}
        onAction={noop}
        onPause={noop}
        onResume={noop}
      />,
    )

    expect(withAction).toContain('Undo')
    expect(withoutAction).toContain('Set logged')
    expect(withoutAction).not.toContain('toast-action')
  })
})
