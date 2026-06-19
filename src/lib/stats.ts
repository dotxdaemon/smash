// ABOUTME: Aggregates saved sets into overall, per-opponent, and recent-form records.
// ABOUTME: Keeps scoreboard and stats math deterministic and independent from views.
import type { SetEntry } from '../types'

export type WinLossRecord = {
  wins: number
  losses: number
  total: number
  winRate: number | null
}

export type OpponentRecord = WinLossRecord & {
  name: string
}

export function getOverallRecord(sets: SetEntry[]): WinLossRecord {
  return toRecord(sets)
}

export function getOpponentRecords(sets: SetEntry[]): OpponentRecord[] {
  const byOpponent = new Map<string, SetEntry[]>()
  for (const set of sets) {
    const group = byOpponent.get(set.opponent) ?? []
    group.push(set)
    byOpponent.set(set.opponent, group)
  }

  return Array.from(byOpponent.entries())
    .map(([name, group]) => ({ name, ...toRecord(group) }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
}

export function getRecentForm(
  sets: SetEntry[],
  limit = 5,
): Array<'win' | 'loss'> {
  return [...sets]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map((set) => set.result)
}

function toRecord(sets: SetEntry[]): WinLossRecord {
  let wins = 0
  let losses = 0
  for (const set of sets) {
    if (set.result === 'win') wins++
    else losses++
  }
  const total = wins + losses
  return { wins, losses, total, winRate: total > 0 ? wins / total : null }
}
