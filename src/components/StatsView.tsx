// ABOUTME: Shows per-opponent records with a win-rate bar and quick matchup access.
// ABOUTME: Falls back to an empty state until sets have been logged.
import { EmptyState } from './EmptyState'
import { formatWinRate } from '../lib/format'
import type { OpponentRecord } from '../lib/stats'

type StatsViewProps = {
  records: OpponentRecord[]
  onOpenOpponent: (opponent: string) => void
  onLog: () => void
}

export function StatsView({ records, onOpenOpponent, onLog }: StatsViewProps) {
  if (records.length === 0) {
    return (
      <EmptyState
        glyph="績"
        title="No stats yet"
        text="Your win rate and matchup breakdown appear here once you log sets."
        actionLabel="Log a set"
        onAction={onLog}
      />
    )
  }

  return (
    <ul className="stats-list">
      {records.map((record) => {
        const percent =
          record.winRate === null ? null : Math.round(record.winRate * 100)
        return (
          <li key={record.name} className="stat-row">
            <div className="stat-head">
              <button
                type="button"
                className="stat-name"
                onClick={() => onOpenOpponent(record.name)}
              >
                {record.name}
              </button>
              <div className="stat-record">
                <span className="wins">{record.wins}W</span>
                <span className="losses">{record.losses}L</span>
                <span className="rate">{formatWinRate(record.winRate)}</span>
              </div>
            </div>
            <div
              className="stat-bar"
              role="img"
              aria-label={`${record.wins} wins, ${record.losses} losses${
                percent === null ? '' : `, ${percent} percent win rate`
              }`}
            >
              <span className="stat-bar-fill" style={{ width: `${percent ?? 0}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
