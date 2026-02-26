// ABOUTME: Computes weekly entry trend points for matchup pages.
// ABOUTME: Produces deterministic grouped counts to render a lightweight sparkline.
import type { MatchEntry } from '../types'

export interface TrendPoint {
  weekStart: string
  count: number
}

export function buildWeeklyTrend(entries: MatchEntry[]): TrendPoint[] {
  const counts = new Map<string, number>()

  for (const entry of entries) {
    const weekStart = getWeekStart(entry.date)
    counts.set(weekStart, (counts.get(weekStart) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([weekStart, count]) => ({ weekStart, count }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}

function getWeekStart(dateValue: string): string {
  const date = new Date(dateValue)
  const utcDay = date.getUTCDay()
  const shift = utcDay === 0 ? -6 : 1 - utcDay
  date.setUTCDate(date.getUTCDate() + shift)
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString()
}
