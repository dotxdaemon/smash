// ABOUTME: Verifies the stats view shows loss habits alongside opponent records.
// ABOUTME: Keeps the habits card scoped to tagged losses so it never adds noise.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StatsView } from './StatsView'
import type { OpponentRecord } from '../lib/stats'
import type { LossHabit } from '../lib/training'

const records: OpponentRecord[] = [
  { name: 'Fox', wins: 2, losses: 3, total: 5, winRate: 0.4 },
]

const noop = () => {}

describe('StatsView', () => {
  it('renders the loss-habits card with totals and the recent count', () => {
    const habits: LossHabit[] = [
      { id: 'panic-option', label: 'Panic option', total: 3, recent: 2 },
      { id: 'got-grabbed', label: 'Got grabbed', total: 1, recent: 0 },
    ]

    const html = renderToStaticMarkup(
      <StatsView
        records={records}
        habits={habits}
        onOpenOpponent={noop}
        onLog={noop}
      />,
    )

    expect(html).toContain('Loss habits')
    expect(html).toContain('Panic option')
    expect(html).toContain('×3')
    expect(html).toContain('2 in last 10')
    expect(html).not.toContain('0 in last 10')
  })

  it('hides the habits card when no losses carry tags', () => {
    const html = renderToStaticMarkup(
      <StatsView records={records} habits={[]} onOpenOpponent={noop} onLog={noop} />,
    )

    expect(html).not.toContain('Loss habits')
    expect(html).toContain('Fox')
  })
})
